"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =======================================================
     FORGOT PASSWORD
  ======================================================= */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!identifier.trim()) {
      setError("Please enter your mobile number or email address.");
      return;
    }

    try {
      setLoading(true);

      /*
       * POST /auth/forgot-password
       */

      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: identifier.trim(),
          identifier: identifier.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "We couldn't find an account with that information.",
        );
      }

      setSuccess(
        data.message ||
          "If an account exists, password reset instructions have been sent.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to continue. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0f2f5] px-4 py-10">
      <div className="w-full max-w-[500px]">

        {/* =================================================
            SMARTPRIX LOGO
        ================================================= */}

        <div className="mb-6 text-center">
          <Link
            href="/"
            className="
              inline-block
              text-[42px]
              font-extrabold
              tracking-[-2px]
              text-[#1877f2]
              transition
              hover:opacity-90
            "
          >
            Smartprix
          </Link>
        </div>

        {/* =================================================
            FIND ACCOUNT CARD
        ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-lg
            bg-white
            shadow-[0_2px_12px_rgba(0,0,0,0.12)]
          "
        >
          {/* CARD HEADER */}

          <div className="border-b border-[#dadde1] px-6 py-5">
            <h1 className="text-[24px] font-bold text-[#1c1e21]">
              Find your account
            </h1>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="p-6"
          >
            {/* DESCRIPTION */}

            <p className="mb-5 text-[15px] leading-5 text-[#606770]">
              Enter your mobile number or email address.
            </p>

            {/* =================================================
                FLOATING INPUT
            ================================================= */}

            <div className="relative">
              <input
                id="forgot-identifier"
                name="forgot-identifier"
                type="text"
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder=" "
                autoComplete="new-password"
                disabled={loading}
                autoFocus
                className="
                  peer
                  h-[50px]
                  w-full
                  rounded-md
                  border
                  border-[#ccd0d5]
                  bg-white
                  px-4
                  pt-3
                  text-[16px]
                  text-[#1c1e21]
                  outline-none
                  transition
                  focus:border-[#1877f2]
                  focus:ring-1
                  focus:ring-[#1877f2]
                  disabled:bg-gray-100
                "
              />

              <label
                htmlFor="forgot-identifier"
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  bg-white
                  px-1
                  text-[16px]
                  text-[#8a8d91]
                  transition-all
                  duration-150
                  peer-focus:top-0
                  peer-focus:-translate-y-1/2
                  peer-focus:text-[12px]
                  peer-focus:font-medium
                  peer-focus:text-[#1877f2]
                  peer-[:not(:placeholder-shown)]:top-0
                  peer-[:not(:placeholder-shown)]:-translate-y-1/2
                  peer-[:not(:placeholder-shown)]:text-[12px]
                  peer-[:not(:placeholder-shown)]:font-medium
                  peer-[:not(:placeholder-shown)]:text-[#65676b]
                "
              >
                Mobile number or email address
              </label>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="
                  mt-4
                  rounded-md
                  border
                  border-[#f5c2c7]
                  bg-[#fff5f5]
                  px-4
                  py-3
                  text-sm
                  text-[#b42318]
                "
              >
                {error}
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div
                className="
                  mt-4
                  rounded-md
                  border
                  border-[#b7ebc6]
                  bg-[#f0fff4]
                  px-4
                  py-3
                  text-sm
                  text-[#18733c]
                "
              >
                {success}
              </div>
            )}

            {/* =================================================
                CONTINUE BUTTON
            ================================================= */}

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  h-[44px]
                  w-full
                  items-center
                  justify-center
                  rounded-md
                  bg-[#1877f2]
                  text-[15px]
                  font-bold
                  text-white
                  transition
                  hover:bg-[#166fe5]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? "Searching..." : "Continue"}
              </button>
            </div>
          </form>
        </div>

        {/* =================================================
            BACK TO LOGIN
        ================================================= */}

        <div className="mt-5 text-center">
          <Link
            href="/login"
            className="
              text-[14px]
              font-semibold
              text-[#1877f2]
              hover:underline
            "
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}