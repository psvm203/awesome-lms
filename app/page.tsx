"use client";

import { useState, type SubmitEvent } from "react";

const LOGIN_ERROR_MESSAGE = "LMS 로그인 중 오류가 발생했습니다.";
const INVALID_CREDENTIALS_MESSAGE = "학번 또는 비밀번호가 잘못되었습니다.";

type Lecture = {
  subject_id: string;
  week: string;
  subject_name: string;
  title: string;
};

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lectures, setLectures] = useState<Lecture[] | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
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
      const loginResponse = await fetch("http://localhost:8787/login", {
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
        throw new Error(`Login request failed: ${loginResponse.status}`);
      }

      const lecturesResponse = await fetch("http://localhost:8787/lectures", {
        method: "GET",
        credentials: "include",
      });

      if (!lecturesResponse.ok) {
        throw new Error(`Lectures request failed: ${lecturesResponse.status}`);
      }

      const lecturesData = (await lecturesResponse.json()) as Lecture[];
      setLectures(lecturesData);
    } catch {
      alert(LOGIN_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (lectures === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-200 p-4">
        <form className="card w-full max-w-sm bg-base-100 shadow-xl" onSubmit={handleSubmit}>
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
      <section className="mx-auto w-full max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">강의 목록</h1>
        <ul className="list rounded-box bg-base-100 shadow-xl">
          {lectures.length === 0 ? (
            <li className="list-row">
              <div>표시할 강의가 없습니다.</div>
            </li>
          ) : (
            lectures.map((lecture) => (
              <li
                key={`${lecture.subject_id}-${lecture.week}-${lecture.title}`}
                className="list-row"
              >
                <div>{`${lecture.subject_name} - ${lecture.title}`}</div>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
