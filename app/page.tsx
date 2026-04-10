"use client";

import type { SubmitEvent } from "react";

const SESSION_ERROR_MESSAGE = "LMS 세션 연결 중 오류가 발생했습니다.";

async function handleSubmit(
  event: SubmitEvent<HTMLFormElement>,
): Promise<void> {
  event.preventDefault();

  try {
    const response = await fetch("http://localhost:8787/session", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Session request failed: ${response.status}`);
    }
  } catch {
    alert(SESSION_ERROR_MESSAGE);
  }
}

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <form
        className="card w-full max-w-sm bg-base-100 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div className="card-body gap-4">
          <input
            type="text"
            placeholder="학번"
            className="input input-bordered w-full"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="input input-bordered w-full"
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-primary w-full">
            로그인
          </button>
        </div>
      </form>
    </main>
  );
}
