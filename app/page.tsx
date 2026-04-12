"use client";

import type { SubmitEvent } from "react";

const LOGIN_ERROR_MESSAGE = "LMS 로그인 중 오류가 발생했습니다.";
const INVALID_CREDENTIALS_MESSAGE = "학번 또는 비밀번호가 잘못되었습니다.";

async function handleSubmit(
  event: SubmitEvent<HTMLFormElement>,
): Promise<void> {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const usr_id = String(formData.get("id") ?? "");
  const usr_pwd = String(formData.get("pwd") ?? "");
  const body = [
    `usr_id=${encodeURIComponent(usr_id).replace(/%20/g, "+")}`,
    `usr_pwd=${encodeURIComponent(usr_pwd).replace(/%20/g, "+")}`,
  ].join("&");

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
  } catch {
    alert(LOGIN_ERROR_MESSAGE);
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
          <button type="submit" className="btn btn-primary w-full">
            로그인
          </button>
        </div>
      </form>
    </main>
  );
}
