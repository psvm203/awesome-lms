"use client";

import { useState, type SubmitEvent } from "react";

const LOGIN_ERROR_MESSAGE = "LMS 로그인 중 오류가 발생했습니다.";
const INVALID_CREDENTIALS_MESSAGE = "학번 또는 비밀번호가 잘못되었습니다.";
const VIEW_ERROR_MESSAGE = "강의 수강 중 오류가 발생했습니다.";
const LECTURE_EXIT_ANIMATION_MS = 900;
const PROXY_BASE_URL = "https://awesome-lms-proxy.psvm203.workers.dev";

type Lecture = {
    subject_id: string;
    sequence: string;
    subject_name: string;
    title: string;
};

export default function Home() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lectures, setLectures] = useState<Lecture[] | null>(null);
    const [viewingKey, setViewingKey] = useState<string | null>(null);
    const [exitingLectureKeys, setExitingLectureKeys] = useState<string[]>([]);

    function lectureKey(lecture: Lecture): string {
        return `${lecture.subject_id}-${lecture.sequence}-${lecture.title}`;
    }

    function handleLogout(): void {
        setLectures(null);
    }

    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const formData = new FormData(event.currentTarget);
        const usr_id = String(formData.get("id") ?? "");
        const usr_pwd = String(formData.get("pwd") ?? "");
        const body = [
            `usr_id=${encodeURIComponent(usr_id).replace(/%20/g, "+")}`,
            `usr_pwd=${encodeURIComponent(usr_pwd).replace(/%20/g, "+")}`,
        ].join("&");

        setIsSubmitting(true);

        try {
            const loginResponse = await fetch(`${PROXY_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                credentials: "include",
                body,
            });

            if (loginResponse.status === 401) {
                alert(INVALID_CREDENTIALS_MESSAGE);
                return;
            }

            if (!loginResponse.ok) {
                throw new Error(
                    `Login request failed: ${loginResponse.status}`,
                );
            }

            const lecturesResponse = await fetch(
                `${PROXY_BASE_URL}/lectures`,
                {
                    method: "GET",
                    credentials: "include",
                },
            );

            if (!lecturesResponse.ok) {
                throw new Error(
                    `Lectures request failed: ${lecturesResponse.status}`,
                );
            }

            const lecturesData = (await lecturesResponse.json()) as Lecture[];
            setLectures(lecturesData);
        } catch {
            alert(LOGIN_ERROR_MESSAGE);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleViewLecture(lecture: Lecture): Promise<void> {
        const key = lectureKey(lecture);
        if (
            viewingKey !== null ||
            lectures === null ||
            exitingLectureKeys.length > 0
        ) {
            return;
        }

        const body = [
            `subject_id=${encodeURIComponent(lecture.subject_id).replace(/%20/g, "+")}`,
            `sequence=${encodeURIComponent(lecture.sequence).replace(/%20/g, "+")}`,
        ].join("&");

        setViewingKey(key);

        try {
            const response = await fetch(`${PROXY_BASE_URL}/view`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                credentials: "include",
                body,
            });

            if (!response.ok) {
                throw new Error(`View request failed: ${response.status}`);
            }

            const updatedLectures = (await response.json()) as Lecture[];
            const updatedLectureKeys = new Set(updatedLectures.map(lectureKey));
            const removedLectureKeys = lectures
                .map(lectureKey)
                .filter((currentKey) => !updatedLectureKeys.has(currentKey));

            if (removedLectureKeys.length === 0) {
                setLectures(updatedLectures);
                return;
            }

            setExitingLectureKeys(removedLectureKeys);
            window.setTimeout(() => {
                setLectures(updatedLectures);
                setExitingLectureKeys([]);
            }, LECTURE_EXIT_ANIMATION_MS);
        } catch {
            alert(VIEW_ERROR_MESSAGE);
        } finally {
            setViewingKey(null);
        }
    }

    if (lectures === null) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-base-200 p-4">
                <form
                    className="card w-full max-w-sm bg-base-100 shadow-xl"
                    onSubmit={handleSubmit}
                >
                    <div className="card-body gap-4">
                        <input
                            type="text"
                            name="id"
                            placeholder="학번"
                            className="input input-bordered w-full"
                            autoComplete="username"
                        />
                        <input
                            type="password"
                            name="pwd"
                            placeholder="비밀번호"
                            className="input input-bordered w-full"
                            autoComplete="current-password"
                        />
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                        >
                            {isSubmitting ? "로그인 중..." : "로그인"}
                        </button>
                    </div>
                </form>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-base-200 p-4 sm:p-8">
            <section className="mx-auto w-full max-w-3xl space-y-5">
                <header className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            강의 목록
                        </h1>
                        <p className="text-sm text-base-content/70">
                            수강할 강의를 선택해 주세요.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={handleLogout}
                    >
                        로그아웃
                    </button>
                </header>

                {lectures.length === 0 ? (
                    <article className="card border border-dashed border-base-300 bg-base-100">
                        <div className="card-body py-10 text-center text-base-content/70">
                            표시할 강의가 없습니다.
                        </div>
                    </article>
                ) : (
                    <div className="space-y-3">
                        {lectures.map((lecture) => (
                            <article
                                key={lectureKey(lecture)}
                                className={`card relative z-0 border border-base-300 bg-base-100 shadow-sm transition hover:shadow-md ${
                                    exitingLectureKeys.includes(
                                        lectureKey(lecture),
                                    )
                                        ? "lecture-card-exit pointer-events-none"
                                        : ""
                                }`}
                            >
                                <div className="card-body p-4 sm:p-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <span className="text-base font-medium leading-snug">
                                            {`${lecture.subject_name} - ${lecture.title}`}
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-info shrink-0 text-info-content"
                                            onClick={() =>
                                                void handleViewLecture(lecture)
                                            }
                                            disabled={
                                                viewingKey !== null ||
                                                exitingLectureKeys.length > 0
                                            }
                                            aria-busy={
                                                viewingKey ===
                                                lectureKey(lecture)
                                            }
                                        >
                                            수강
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <button type="button" className="btn btn-primary btn-lg w-full">
                    전체 수강
                </button>
            </section>
        </main>
    );
}
