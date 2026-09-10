"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const NO_ACCOUNT_MESSAGE =
  "No account found. Check your mobile number or email address and try again.";

type Step =
  | "find"
  | "account"
  | "code"
  | "password"
  | "success";

interface RecoveryAccount {
  userId: string;
  maskedEmail: string;
  maskedMobile?: string | null;
  recoveryMethods?: {
    type: "email";
    label: string;
  }[];
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface FindAccountData {
  userId: string;
  maskedEmail: string;
  maskedMobile?: string | null;
  recoveryMethods?: {
    type: "email";
    label: string;
  }[];
}

interface SendCodeData {
  maskedEmail: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
}

interface VerifyCodeData {
  resetToken: string;
  expiresInSeconds: number;
}

function EyeIcon({ off = false }: { off?: boolean }) {
  if (off) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        <path d="M4 20L20 4" />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remaining,
  ).padStart(2, "0")}`;
}

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (password.length >= 12 && score < 5) {
    score++;
  }

  if (!password) {
    return {
      score: 0,
      label: "",
    };
  }

  if (score <= 2) {
    return {
      score: 2,
      label: "Weak",
    };
  }

  if (score <= 4) {
    return {
      score: 4,
      label: "Good",
    };
  }

  return {
    score: 5,
    label: "Strong",
  };
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("find");

  const [identifier, setIdentifier] = useState("");
  const [account, setAccount] =
    useState<RecoveryAccount | null>(null);

  const [selectedMethod, setSelectedMethod] =
    useState<"email">("email");

  const [code, setCode] = useState("");
  const [codeTimer, setCodeTimer] = useState(0);
  const [resendTimer, setResendTimer] =
    useState(0);

  const [resetToken, setResetToken] =
    useState("");

  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [eyeAnimating, setEyeAnimating] =
    useState<"password" | "confirm" | null>(
      null,
    );

  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");
  const [accountNotFound, setAccountNotFound] =
    useState(false);

  const strength =
    useMemo(
      () => getPasswordStrength(password),
      [password],
    );

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  useEffect(() => {
    if (codeTimer <= 0) return;

    const timer = window.setInterval(() => {
      setCodeTimer((value) =>
        Math.max(value - 1, 0),
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [codeTimer]);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = window.setInterval(() => {
      setResendTimer((value) =>
        Math.max(value - 1, 0),
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendTimer]);

  function clearError() {
    setError("");
    setAccountNotFound(false);
  }

  function goBack() {
    clearError();

    if (step === "account") {
      setStep("find");
      return;
    }

    if (step === "code") {
      setStep("account");
      return;
    }

    if (step === "password") {
      setStep("code");
      return;
    }

    window.history.back();
  }

  async function post<T>(
    endpoint: string,
    body: Record<string, unknown>,
  ): Promise<{
    response: Response;
    result: ApiResponse<T>;
  }> {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    let result: ApiResponse<T> = {};

    try {
      result =
        (await response.json()) as ApiResponse<T>;
    } catch {
      result = {};
    }

    return {
      response,
      result,
    };
  }

  async function handleFindAccount(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanIdentifier =
      identifier.trim();

    if (!cleanIdentifier) {
      setError(
        "Please enter your mobile number or email address.",
      );
      return;
    }

    setLoading(true);
    clearError();

    try {
      const {
        response,
        result,
      } = await post<FindAccountData>(
        "/auth/forgot-password",
        {
          identifier: cleanIdentifier,
        },
      );

      if (
        response.status === 404 ||
        result.message ===
          NO_ACCOUNT_MESSAGE
      ) {
        setAccountNotFound(true);
        setError(NO_ACCOUNT_MESSAGE);
        return;
      }

      if (
        !response.ok ||
        !result.success ||
        !result.data
      ) {
        setError(
          result.message ??
            "Unable to find your account. Please try again.",
        );
        return;
      }

      setAccount({
        userId: result.data.userId,
        maskedEmail:
          result.data.maskedEmail,
        maskedMobile:
          result.data.maskedMobile,
        recoveryMethods:
          result.data.recoveryMethods,
      });

      setSelectedMethod("email");
      setStep("account");
    } catch {
      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode() {
    if (!identifier.trim()) return;

    setLoading(true);
    setError("");

    try {
      const {
        response,
        result,
      } = await post<SendCodeData>(
        "/auth/password-reset/send-code",
        {
          identifier: identifier.trim(),
        },
      );

      if (!response.ok || !result.success) {
        setError(
          result.message ??
            "Unable to send the verification code.",
        );
        return;
      }

      const expires =
        result.data?.expiresInSeconds ??
        600;

      const resendAfter =
        result.data?.resendAfterSeconds ??
        60;

      setCode("");
      setCodeTimer(expires);
      setResendTimer(resendAfter);
      setError("");
      setStep("code");
    } catch {
      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      setError(
        "Enter the 6-digit verification code.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        response,
        result,
      } = await post<VerifyCodeData>(
        "/auth/password-reset/verify-code",
        {
          identifier: identifier.trim(),
          code,
        },
      );

      if (!response.ok || !result.success) {
        setError(
          result.message ??
            "The verification code is invalid.",
        );
        return;
      }

      if (!result.data?.resetToken) {
        setError(
          "Verification succeeded, but your reset session could not be created.",
        );
        return;
      }

      setResetToken(
        result.data.resetToken,
      );

      setCodeTimer(0);
      setResendTimer(0);
      setError("");
      setStep("password");
    } catch {
      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (resendTimer > 0 || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        response,
        result,
      } = await post<SendCodeData>(
        "/auth/password-reset/resend-code",
        {
          identifier: identifier.trim(),
        },
      );

      if (!response.ok || !result.success) {
        setError(
          result.message ??
            "Unable to resend the verification code.",
        );
        return;
      }

      setCode("");
      setCodeTimer(
        result.data?.expiresInSeconds ??
          600,
      );
      setResendTimer(
        result.data?.resendAfterSeconds ??
          60,
      );
    } catch {
      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!resetToken) {
      setError(
        "Your password reset session is invalid or expired.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Your new password must be at least 8 characters long.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        response,
        result,
      } = await post(
        "/auth/reset-password",
        {
          token: resetToken,
          newPassword: password,
        },
      );

      if (!response.ok || !result.success) {
        setError(
          result.message ??
            "Unable to reset your password.",
        );
        return;
      }

      setResetToken("");
      setPassword("");
      setConfirmPassword("");
      setStep("success");
    } catch {
      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function togglePassword(
    field: "password" | "confirm",
  ) {
    setEyeAnimating(field);

    if (field === "password") {
      setShowPassword(
        (value) => !value,
      );
    } else {
      setShowConfirmPassword(
        (value) => !value,
      );
    }

    window.setTimeout(() => {
      setEyeAnimating(null);
    }, 180);
  }

  function handleCodeChange(
    value: string,
  ) {
    const digits =
      value.replace(/\D/g, "");

    setCode(digits.slice(0, 6));

    if (error) {
      setError("");
    }
  }

  return (
    <main className="min-h-screen bg-[#f0f2f5] px-4 py-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[520px] flex-col items-center justify-center">
        {/* Brand */}
        <Link
          href="/"
          className="mb-7 text-[34px] font-extrabold tracking-[-1.5px] text-[#1877f2] transition-opacity hover:opacity-85"
        >
          Smartprix
        </Link>

        {/* Progress */}
        {step !== "success" && (
          <div className="mb-5 flex w-full max-w-[460px] items-center justify-center gap-2">
            {[
              "find",
              "account",
              "code",
              "password",
            ].map(
              (item, index) => {
                const steps = [
                  "find",
                  "account",
                  "code",
                  "password",
                ];

                const currentIndex =
                  steps.indexOf(step);

                const active =
                  index <= currentIndex;

                return (
                  <div
                    key={item}
                    className="flex flex-1 items-center gap-2"
                  >
                    <div
                      className={`
                        h-1.5 w-full rounded-full
                        transition-all duration-300
                        ${
                          active
                            ? "bg-[#1877f2]"
                            : "bg-[#d8dadf]"
                        }
                      `}
                    />
                  </div>
                );
              },
            )}
          </div>
        )}

        {/* Card */}
        <section className="w-full overflow-hidden rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
          {/* Find account */}
          {step === "find" && (
            <form
              onSubmit={handleFindAccount}
              className="px-7 pb-8 pt-7 sm:px-9"
            >
              <h1 className="text-center text-[24px] font-bold tracking-[-0.3px] text-[#1c1e21]">
                Find your account
              </h1>

              <p className="mt-2 text-center text-[15px] leading-6 text-[#65676b]">
                Enter your mobile number or
                email address.
              </p>

              <div className="mt-7">
                <div className="relative">
                  <input
                    id="recovery-identifier"
                    name="recovery_identifier"
                    type="text"
                    value={identifier}
                    onChange={(event) => {
                      setIdentifier(
                        event.target.value,
                      );
                      clearError();
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    disabled={loading}
                    placeholder=" "
                    className={`
                      peer h-[58px] w-full rounded-lg
                      border bg-white px-4 pb-1 pt-5
                      text-[16px] text-[#1c1e21]
                      outline-none transition-all
                      ${
                        accountNotFound
                          ? "border-[#e41e3f] focus:border-[#e41e3f] focus:ring-2 focus:ring-[#e41e3f]/10"
                          : "border-[#ccd0d5] focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/10"
                      }
                    `}
                  />

                  <label
                    htmlFor="recovery-identifier"
                    className={`
                      pointer-events-none absolute left-4
                      top-1/2 -translate-y-1/2
                      bg-white px-1 text-[16px]
                      transition-all duration-150
                      peer-focus:top-0
                      peer-focus:text-[12px]
                      peer-focus:font-semibold
                      ${
                        identifier
                          ? "top-0 text-[12px]"
                          : ""
                      }
                      ${
                        accountNotFound
                          ? "text-[#e41e3f]"
                          : "text-[#65676b] peer-focus:text-[#1877f2]"
                      }
                    `}
                  >
                    Mobile number or email address
                  </label>
                </div>

                {error && (
                  <div
                    className="mt-3 flex items-start gap-2 text-[13px] leading-5 text-[#e41e3f]"
                    role="alert"
                  >
                    <span className="mt-[1px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-[#e41e3f] text-[11px] font-bold text-white">
                      !
                    </span>

                    <span>{error}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  mt-6 flex h-[50px] w-full
                  items-center justify-center gap-2
                  rounded-full bg-[#1877f2]
                  text-[16px] font-bold text-white
                  transition-all duration-150
                  hover:bg-[#166fe5]
                  hover:shadow-md
                  active:scale-[0.98]
                  disabled:cursor-wait
                  disabled:opacity-70
                "
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Finding account...
                  </>
                ) : (
                  <>
                    <SearchIcon />
                    Continue
                  </>
                )}
              </button>

              <div className="mt-6 border-t border-[#e4e6eb] pt-5 text-center">
                <Link
                  href="/login"
                  className="text-[15px] font-semibold text-[#1877f2] hover:underline"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}

          {/* Account found */}
          {step === "account" &&
            account && (
              <div className="px-7 pb-8 pt-7 sm:px-9">
                <button
                  type="button"
                  onClick={goBack}
                  className="mb-4 flex items-center gap-1 text-[14px] font-semibold text-[#65676b] transition-colors hover:text-[#1877f2]"
                >
                  <ArrowLeftIcon />
                  Back
                </button>

                <h1 className="text-[24px] font-bold tracking-[-0.3px] text-[#1c1e21]">
                  Account found
                </h1>

                <p className="mt-2 text-[15px] leading-6 text-[#65676b]">
                  Choose where you'd like to
                  receive your verification code.
                </p>

                <div className="mt-6 rounded-xl border border-[#e4e6eb] bg-[#f7f8fa] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e7f3ff] text-[#1877f2]">
                      <MailIcon />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[#65676b]">
                        Your account
                      </p>

                      <p className="truncate text-[16px] font-semibold text-[#1c1e21]">
                        {account.maskedEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedMethod("email")
                  }
                  className={`
                    mt-5 flex w-full items-center
                    gap-3 rounded-xl border p-4
                    text-left transition-all
                    ${
                      selectedMethod === "email"
                        ? "border-[#1877f2] bg-[#f0f6ff] shadow-sm"
                        : "border-[#ccd0d5] bg-white hover:bg-[#f7f8fa]"
                    }
                  `}
                >
                  <div
                    className={`
                      flex h-5 w-5 shrink-0
                      items-center justify-center
                      rounded-full border-2
                      ${
                        selectedMethod ===
                        "email"
                          ? "border-[#1877f2]"
                          : "border-[#8a8d91]"
                      }
                    `}
                  >
                    {selectedMethod ===
                      "email" && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#1877f2]" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <MailIcon />

                    <div>
                      <p className="text-[15px] font-semibold text-[#1c1e21]">
                        Send code to email
                      </p>

                      <p className="mt-0.5 text-[13px] text-[#65676b]">
                        {account.maskedEmail}
                      </p>
                    </div>
                  </div>
                </button>

                {error && (
                  <div
                    className="mt-3 flex items-start gap-2 text-[13px] leading-5 text-[#e41e3f]"
                    role="alert"
                  >
                    <span className="mt-[1px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-[#e41e3f] text-[11px] font-bold text-white">
                      !
                    </span>

                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading}
                  className="
                    mt-6 flex h-[50px] w-full
                    items-center justify-center gap-2
                    rounded-full bg-[#1877f2]
                    text-[16px] font-bold text-white
                    transition-all duration-150
                    hover:bg-[#166fe5]
                    hover:shadow-md
                    active:scale-[0.98]
                    disabled:cursor-wait
                    disabled:opacity-70
                  "
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Sending code...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            )}

          {/* Verification code */}
          {step === "code" && (
            <form
              onSubmit={handleVerifyCode}
              className="px-7 pb-8 pt-7 sm:px-9"
            >
              <button
                type="button"
                onClick={goBack}
                className="mb-4 flex items-center gap-1 text-[14px] font-semibold text-[#65676b] transition-colors hover:text-[#1877f2]"
              >
                <ArrowLeftIcon />
                Back
              </button>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f3ff] text-[#1877f2]">
                <ShieldIcon />
              </div>

              <h1 className="mt-5 text-center text-[24px] font-bold tracking-[-0.3px] text-[#1c1e21]">
                Enter verification code
              </h1>

              <p className="mx-auto mt-2 max-w-[390px] text-center text-[15px] leading-6 text-[#65676b]">
                We sent a 6-digit code to{" "}
                <strong className="font-semibold text-[#1c1e21]">
                  {account?.maskedEmail}
                </strong>
                .
              </p>

              <div className="mt-7">
                <label
                  htmlFor="verification-code"
                  className="mb-2 block text-[13px] font-semibold text-[#65676b]"
                >
                  Verification code
                </label>

                <input
                  id="verification-code"
                  name="verification_code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(event) =>
                    handleCodeChange(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  autoFocus
                  className="
                    h-[58px] w-full rounded-lg
                    border border-[#ccd0d5]
                    bg-white text-center
                    text-[25px] font-bold
                    tracking-[10px] text-[#1c1e21]
                    outline-none
                    transition-all
                    focus:border-[#1877f2]
                    focus:ring-2
                    focus:ring-[#1877f2]/10
                  "
                  placeholder="------"
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-[13px]">
                <span className="text-[#65676b]">
                  {codeTimer > 0
                    ? `Code expires in ${formatTimer(codeTimer)}`
                    : "Code has expired"}
                </span>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={
                    resendTimer > 0 ||
                    loading
                  }
                  className={`
                    font-semibold
                    ${
                      resendTimer > 0 ||
                      loading
                        ? "cursor-not-allowed text-[#bcc0c4]"
                        : "text-[#1877f2] hover:underline"
                    }
                  `}
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend code"}
                </button>
              </div>

              {error && (
                <div
                  className="mt-4 flex items-start gap-2 text-[13px] leading-5 text-[#e41e3f]"
                  role="alert"
                >
                  <span className="mt-[1px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-[#e41e3f] text-[11px] font-bold text-white">
                    !
                  </span>

                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  code.length !== 6
                }
                className="
                  mt-6 flex h-[50px] w-full
                  items-center justify-center gap-2
                  rounded-full bg-[#1877f2]
                  text-[16px] font-bold text-white
                  transition-all duration-150
                  hover:bg-[#166fe5]
                  hover:shadow-md
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Verifying...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          )}

          {/* New password */}
          {step === "password" && (
            <form
              onSubmit={handleResetPassword}
              className="px-7 pb-8 pt-7 sm:px-9"
            >
              <button
                type="button"
                onClick={goBack}
                className="mb-4 flex items-center gap-1 text-[14px] font-semibold text-[#65676b] transition-colors hover:text-[#1877f2]"
              >
                <ArrowLeftIcon />
                Back
              </button>

              <h1 className="text-[24px] font-bold tracking-[-0.3px] text-[#1c1e21]">
                Create new password
              </h1>

              <p className="mt-2 text-[15px] leading-6 text-[#65676b]">
                Choose a strong password that
                you don't use anywhere else.
              </p>

              {/* Password */}
              <div className="mt-7">
                <div className="relative">
                  <input
                    id="new-password"
                    name="new_password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(
                        event.target.value,
                      );
                      if (error) {
                        setError("");
                      }
                    }}
                    autoComplete="new-password"
                    placeholder=" "
                    disabled={loading}
                    className="
                      peer h-[58px] w-full
                      rounded-lg border
                      border-[#ccd0d5]
                      bg-white px-4 pb-1
                      pt-5 pr-12
                      text-[16px] text-[#1c1e21]
                      outline-none
                      transition-all
                      focus:border-[#1877f2]
                      focus:ring-2
                      focus:ring-[#1877f2]/10
                    "
                  />

                  <label
                    htmlFor="new-password"
                    className={`
                      pointer-events-none
                      absolute left-4
                      top-1/2
                      -translate-y-1/2
                      bg-white px-1
                      text-[16px]
                      text-[#65676b]
                      transition-all
                      peer-focus:top-0
                      peer-focus:text-[12px]
                      peer-focus:font-semibold
                      peer-focus:text-[#1877f2]
                      ${
                        password
                          ? "top-0 text-[12px]"
                          : ""
                      }
                    `}
                  >
                    New password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      togglePassword(
                        "password",
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#65676b] transition-colors hover:bg-[#f0f2f5] hover:text-[#1877f2]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <span
                      className={`
                        flex items-center
                        justify-center
                        transition-transform
                        duration-180
                        ease-out
                        ${
                          eyeAnimating ===
                          "password"
                            ? "scale-75"
                            : "scale-100"
                        }
                      `}
                    >
                      <EyeIcon
                        off={!showPassword}
                      />
                    </span>
                  </button>
                </div>

                {password && (
                  <div className="mt-3">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(
                        (bar) => (
                          <div
                            key={bar}
                            className={`
                              h-1.5 flex-1
                              rounded-full
                              transition-all
                              duration-200
                              ${
                                bar <=
                                strength.score
                                  ? "bg-[#1877f2]"
                                  : "bg-[#e4e6eb]"
                              }
                            `}
                          />
                        ),
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[12px] text-[#65676b]">
                        Use 8+ characters with
                        uppercase, numbers and
                        symbols.
                      </span>

                      <span
                        className={`
                          shrink-0 text-[12px]
                          font-bold
                          ${
                            strength.label ===
                            "Strong"
                              ? "text-[#31a24c]"
                              : strength.label ===
                                "Good"
                                ? "text-[#1877f2]"
                                : "text-[#e41e3f]"
                          }
                        `}
                      >
                        {strength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div className="mt-5">
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirm_password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(
                        event.target.value,
                      );
                      if (error) {
                        setError("");
                      }
                    }}
                    autoComplete="new-password"
                    placeholder=" "
                    disabled={loading}
                    className={`
                      peer h-[58px] w-full
                      rounded-lg border
                      bg-white px-4 pb-1
                      pt-5 pr-12
                      text-[16px] text-[#1c1e21]
                      outline-none
                      transition-all
                      ${
                        confirmPassword &&
                        !passwordsMatch
                          ? "border-[#e41e3f]"
                          : "border-[#ccd0d5] focus:border-[#1877f2]"
                      }
                      focus:ring-2
                      focus:ring-[#1877f2]/10
                    `}
                  />

                  <label
                    htmlFor="confirm-password"
                    className={`
                      pointer-events-none
                      absolute left-4
                      top-1/2
                      -translate-y-1/2
                      bg-white px-1
                      text-[16px]
                      text-[#65676b]
                      transition-all
                      peer-focus:top-0
                      peer-focus:text-[12px]
                      peer-focus:font-semibold
                      peer-focus:text-[#1877f2]
                      ${
                        confirmPassword
                          ? "top-0 text-[12px]"
                          : ""
                      }
                    `}
                  >
                    Confirm new password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      togglePassword(
                        "confirm",
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#65676b] transition-colors hover:bg-[#f0f2f5] hover:text-[#1877f2]"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <span
                      className={`
                        flex items-center
                        justify-center
                        transition-transform
                        duration-180
                        ease-out
                        ${
                          eyeAnimating ===
                          "confirm"
                            ? "scale-75"
                            : "scale-100"
                        }
                      `}
                    >
                      <EyeIcon
                        off={
                          !showConfirmPassword
                        }
                      />
                    </span>
                  </button>
                </div>

                {confirmPassword &&
                  !passwordsMatch && (
                    <p className="mt-2 text-[12px] font-medium text-[#e41e3f]">
                      Passwords do not match.
                    </p>
                  )}

                {passwordsMatch && (
                  <p className="mt-2 text-[12px] font-medium text-[#31a24c]">
                    Passwords match.
                  </p>
                )}
              </div>

              {error && (
                <div
                  className="mt-4 flex items-start gap-2 text-[13px] leading-5 text-[#e41e3f]"
                  role="alert"
                >
                  <span className="mt-[1px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-[#e41e3f] text-[11px] font-bold text-white">
                    !
                  </span>

                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  password.length < 8 ||
                  !passwordsMatch
                }
                className="
                  mt-6 flex h-[50px] w-full
                  items-center justify-center gap-2
                  rounded-full bg-[#1877f2]
                  text-[16px] font-bold text-white
                  transition-all duration-150
                  hover:bg-[#166fe5]
                  hover:shadow-md
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Updating password...
                  </>
                ) : (
                  "Update password"
                )}
              </button>
            </form>
          )}

          {/* Success */}
          {step === "success" && (
            <div className="px-7 pb-9 pt-9 text-center sm:px-9">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e7f7ed] text-[#31a24c]">
                <CheckIcon />
              </div>

              <h1 className="mt-6 text-[25px] font-bold tracking-[-0.4px] text-[#1c1e21]">
                Password updated!
              </h1>

              <p className="mx-auto mt-3 max-w-[370px] text-[15px] leading-6 text-[#65676b]">
                Your Smartprix password has
                been changed successfully. You
                can now log in with your new
                password.
              </p>

              <Link
                href="/login"
                className="
                  mt-7 flex h-[50px] w-full
                  items-center justify-center
                  rounded-full bg-[#1877f2]
                  text-[16px] font-bold text-white
                  transition-all duration-150
                  hover:bg-[#166fe5]
                  hover:shadow-md
                  active:scale-[0.98]
                "
              >
                Log in
              </Link>
            </div>
          )}
        </section>

        {/* Footer */}
        <p className="mt-7 text-center text-[12px] text-[#8a8d91]">
          Smartprix helps you discover,
          compare and choose the right
          products.
        </p>
      </div>
    </main>
  );
}
