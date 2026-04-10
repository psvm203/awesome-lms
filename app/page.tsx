"use client";

import type { FormEvent } from "react";

export default function Home() {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await fetch("http://localhost:8787/session", {
      method: "GET",
      credentials: "include",
    });
  };

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
