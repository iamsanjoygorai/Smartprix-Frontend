"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

const NO_ACCOUNT_MESSAGE =
"No account found. Check your mobile number or email address and try again.";

type Step =
| "find"
| "account"
| "loginPassword"
| "code"
| "newPassword"
| "success";

type RecoveryMethod = "password" | "email" | "mobile";

interface RecoveryMethodOption {
type: "email" | "mobile";
label: string;
}

interface RecoveryAccount {
userId: string;
maskedEmail?: string | null;
maskedMobile?: string | null;
recoveryMethods?: RecoveryMethodOption[];
}

interface ApiResponse<T = unknown> {
success?: boolean;
message?: string;
data?: T;
}

interface FindAccountData {
userId: string;
maskedEmail?: string | null;
maskedMobile?: string | null;
recoveryMethods?: RecoveryMethodOption[];
}

interface SendCodeData {
maskedEmail?: string | null;
maskedMobile?: string | null;
expiresInSeconds: number;
resendAfterSeconds: number;
}

interface VerifyCodeData {
resetToken: string;
expiresInSeconds: number;
}

interface VerifyPasswordData {
token: string;
user: {
id: string;
email?: string | null;
mobile?: string | null;
name?: string | null;
role?: string | null;
[key: string]: unknown;
};
}

/* =========================================================
ICONS
========================================================= */

function EyeIcon({ off = false }: { off?: boolean }) {
return ( <svg
   width="20"
   height="20"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
 > <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" /> <circle cx="12" cy="12" r="3" />
{off && <path d="M4 20 20 4" />} </svg>
);
}

function SearchIcon() {
return ( <svg
   width="19"
   height="19"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
 > <circle cx="11" cy="11" r="7" /> <path d="m20 20-4-4" /> </svg>
);
}

function PhoneIcon() {
return ( <svg
   width="20"
   height="20"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
 > <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /> </svg>
);
}

function MailIcon() {
return ( <svg
   width="21"
   height="21"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="1.8"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
 > <rect x="3" y="5" width="18" height="14" rx="2" /> <path d="m3 7 9 6 9-6" /> </svg>
);
}

function KeyIcon() {
return ( <svg
   width="22"
   height="22"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="1.8"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
 > <circle cx="8" cy="15" r="4" /> <path d="m11 12 8-8" /> <path d="m16 5 3 3" /> <path d="m13 9 3 3" /> </svg>
);
}

function LockIcon() {
return ( <svg
   width="21"
   height="21"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="1.8"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
 > <rect x="4" y="10" width="16" height="10" rx="2" /> <path d="M8 10V7a4 4 0 0 1 8 0v3" /> <path d="M12 14v2" /> </svg>
);
}

function CheckIcon() {
return ( <svg
   width="28"
   height="28"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2.5"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
 > <path d="m5 12 4 4L19 6" /> </svg>
);
}

function ArrowLeftIcon() {
return ( <svg
   width="18"
   height="18"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
 > <path d="m15 18-6-6 6-6" /> </svg>
);
}

function ShieldIcon() {
return ( <svg
   width="21"
   height="21"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="1.8"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
 > <path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" /> <path d="m9 12 2 2 4-4" /> </svg>
);
}

/* =========================================================
HELPERS
========================================================= */

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

/* =========================================================
PAGE
========================================================= */

export default function ForgotPasswordPage() {
const router = useRouter();

const [step, setStep] = useState<Step>("find");

const [identifier, setIdentifier] = useState("");

const [account, setAccount] =
useState<RecoveryAccount | null>(null);

const [selectedMethod, setSelectedMethod] =
useState<RecoveryMethod>("email");

const [code, setCode] = useState("");

const [codeTimer, setCodeTimer] = useState(0);
const [resendTimer, setResendTimer] = useState(0);

const [resetToken, setResetToken] = useState("");

const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [loginPassword, setLoginPassword] = useState("");

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] =
useState(false);
const [showLoginPassword, setShowLoginPassword] =
useState(false);

const [eyeAnimating, setEyeAnimating] =
useState<"password" | "confirm" | "login" | null>(null);

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [accountNotFound, setAccountNotFound] = useState(false);

const strength = useMemo(
() => getPasswordStrength(password),
[password],
);

const passwordsMatch =
password.length > 0 &&
confirmPassword.length > 0 &&
password === confirmPassword;

/* =======================================================
TIMERS
======================================================= */

useEffect(() => {
if (codeTimer <= 0) return;

 
const timer = window.setInterval(() => {
  setCodeTimer((value) => Math.max(value - 1, 0));
}, 1000);

return () => window.clearInterval(timer);
 

}, [codeTimer]);

useEffect(() => {
if (resendTimer <= 0) return;

 
const timer = window.setInterval(() => {
  setResendTimer((value) => Math.max(value - 1, 0));
}, 1000);

return () => window.clearInterval(timer);
 

}, [resendTimer]);

/* =======================================================
ERROR
======================================================= */

function clearError() {
setError("");
setAccountNotFound(false);
}

/* =======================================================
BACK
======================================================= */

function goBack() {
clearError();

 
if (step === "account") {
  setStep("find");
  return;
}

if (step === "loginPassword") {
  setLoginPassword("");
  setStep("account");
  return;
}

if (step === "code") {
  setCode("");
  setCodeTimer(0);
  setResendTimer(0);
  setStep("account");
  return;
}

if (step === "newPassword") {
  setPassword("");
  setConfirmPassword("");
  setResetToken("");
  setStep("code");
  return;
}

window.history.back();
 

}

/* =======================================================
POST HELPER
======================================================= */

async function post<T>(
endpoint: string,
body: Record<string, unknown>,
): Promise<{
response: Response;
result: ApiResponse<T>;
}> {
const response = await fetch(`${API_URL}${endpoint}`, {
method: "POST",
headers: {
"Content-Type": "application/json",
Accept: "application/json",
},
body: JSON.stringify(body),
});

 
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

/* =======================================================
FIND ACCOUNT
======================================================= */

async function handleFindAccount(
event: FormEvent<HTMLFormElement>,
) {
event.preventDefault();

 
const cleanIdentifier = identifier.trim();

if (!cleanIdentifier) {
  setError(
    "Please enter your mobile number or email address.",
  );
  return;
}

setLoading(true);
clearError();

try {
  const { response, result } =
    await post<FindAccountData>(
      "/auth/forgot-password",
      {
        identifier: cleanIdentifier,
      },
    );

  if (
    response.status === 404 ||
    result.message === NO_ACCOUNT_MESSAGE
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

  const data = result.data;

  const nextAccount: RecoveryAccount = {
    userId: data.userId,
    maskedEmail: data.maskedEmail,
    maskedMobile: data.maskedMobile,
    recoveryMethods: data.recoveryMethods,
  };

  setAccount(nextAccount);

  /*
   * Prefer mobile when it exists.
   * Otherwise use email.
   */
  if (data.maskedMobile) {
    setSelectedMethod("mobile");
  } else if (data.maskedEmail) {
    setSelectedMethod("email");
  } else {
    setSelectedMethod("password");
  }

  setStep("account");
} catch {
  setError(
    "Unable to connect to the server. Please try again.",
  );
} finally {
  setLoading(false);
}
 

}

/* =======================================================
METHOD CONTINUE
======================================================= */

function handleMethodContinue() {
clearError();

 
if (selectedMethod === "password") {
  setLoginPassword("");
  setStep("loginPassword");
  return;
}

handleSendCode();
 

}

/* =======================================================
PASSWORD LOGIN
======================================================= */

async function handleVerifyRecoveryPassword(
event: FormEvent<HTMLFormElement>,
) {
event.preventDefault();

 
if (!loginPassword) {
  setError("Please enter your password.");
  return;
}

setLoading(true);
clearError();

try {
  const { response, result } =
    await post<VerifyPasswordData>(
      "/auth/password-reset/verify-password",
      {
        identifier: identifier.trim(),
        password: loginPassword,
      },
    );

  if (!response.ok || !result.success) {
    setError(
      result.message ??
        "Incorrect password. Please try again.",
    );
    return;
  }

  const data = result.data;

  if (!data?.token || !data?.user) {
    setError(
      "Password verified, but your login session could not be created.",
    );
    return;
  }

  localStorage.setItem(
    "smartprix_token",
    data.token,
  );

  localStorage.setItem(
    "smartprix_user",
    JSON.stringify(data.user),
  );

  setLoginPassword("");

  const role = String(
    data.user.role ?? "",
  ).toUpperCase();

  if (
    role === "ADMIN" ||
    role === "SUPER_ADMIN"
  ) {
    router.replace("/admin");
  } else {
    router.replace("/");
  }
} catch {
  setError(
    "Unable to connect to the server. Please try again.",
  );
} finally {
  setLoading(false);
}
 

}

/* =======================================================
SEND CODE
======================================================= */

async function handleSendCode() {
if (!identifier.trim() || loading) return;

 
setLoading(true);
clearError();

try {
  const { response, result } =
    await post<SendCodeData>(
      "/auth/password-reset/send-code",
      {
        identifier: identifier.trim(),
        method:
          selectedMethod === "mobile"
            ? "mobile"
            : "email",
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
    result.data?.expiresInSeconds ?? 600;

  const resendAfter =
    result.data?.resendAfterSeconds ?? 60;

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

/* =======================================================
VERIFY CODE
======================================================= */

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
clearError();

try {
  const { response, result } =
    await post<VerifyCodeData>(
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

  setResetToken(result.data.resetToken);
  setCodeTimer(0);
  setResendTimer(0);
  setCode("");
  setStep("newPassword");
} catch {
  setError(
    "Unable to connect to the server. Please try again.",
  );
} finally {
  setLoading(false);
}
 

}

/* =======================================================
RESEND CODE
======================================================= */

async function handleResendCode() {
if (resendTimer > 0 || loading) {
return;
}

 
setLoading(true);
clearError();

try {
  const { response, result } =
    await post<SendCodeData>(
      "/auth/password-reset/resend-code",
      {
        identifier: identifier.trim(),
        method:
          selectedMethod === "mobile"
            ? "mobile"
            : "email",
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
    result.data?.expiresInSeconds ?? 600,
  );

  setResendTimer(
    result.data?.resendAfterSeconds ?? 60,
  );
} catch {
  setError(
    "Unable to connect to the server. Please try again.",
  );
} finally {
  setLoading(false);
}
 

}

/* =======================================================
RESET PASSWORD
======================================================= */

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
  setError("Passwords do not match.");
  return;
}

setLoading(true);
clearError();

try {
  const { response, result } =
    await post(
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

/* =======================================================
PASSWORD EYE
======================================================= */

function togglePassword(
field: "password" | "confirm" | "login",
) {
setEyeAnimating(field);

 
if (field === "password") {
  setShowPassword((value) => !value);
} else if (field === "confirm") {
  setShowConfirmPassword((value) => !value);
} else {
  setShowLoginPassword((value) => !value);
}

window.setTimeout(() => {
  setEyeAnimating(null);
}, 180);
 

}

/* =======================================================
CODE INPUT
======================================================= */

function handleCodeChange(value: string) {
const digits = value.replace(/\D/g, "");

 
setCode(digits.slice(0, 6));

if (error) {
  setError("");
}
 

}

/* =======================================================
RECOVERY DESTINATION
======================================================= */

const recoveryDestination =
selectedMethod === "mobile"
? account?.maskedMobile
: account?.maskedEmail;

const recoveryLabel =
selectedMethod === "mobile"
? "mobile"
: "email";

/* =======================================================
PROGRESS
======================================================= */

const progressSteps = [
"find",
"account",
"method",
"finish",
] as const;

let currentProgressIndex = 0;

if (step === "account") {
currentProgressIndex = 1;
}

if (
step === "loginPassword" ||
step === "code"
) {
currentProgressIndex = 2;
}

if (step === "newPassword") {
currentProgressIndex = 3;
}

/* =======================================================
UI
======================================================= */

return ( <main className="min-h-screen bg-[#f0f2f5] px-4 py-8 sm:py-12"> <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[520px] flex-col items-center justify-center">

 
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
        {progressSteps.map((item, index) => {
          const active =
            index <= currentProgressIndex;

          return (
            <div
              key={item}
              className="flex flex-1 items-center"
            >
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                  active
                    ? "bg-[#1877f2]"
                    : "bg-[#d8dadf]"
                }`}
              />
            </div>
          );
        })}
      </div>
    )}

    {/* Card */}
    <section className="w-full overflow-hidden rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.12)]">

      {/* =================================================
          FIND ACCOUNT
      ================================================== */}

      {step === "find" && (
        <form
          onSubmit={handleFindAccount}
          className="px-7 pb-8 pt-7 sm:px-9"
        >
          <h1 className="text-center text-[24px] font-bold tracking-[-0.3px] text-[#1c1e21]">
            Find your account
          </h1>

          <p className="mt-2 text-center text-[15px] leading-6 text-[#65676b]">
            Enter your mobile number or email address.
          </p>

          <div className="mt-7">
            <div className="relative">
              <input
                id="recovery-identifier"
                name="recovery_identifier"
                type="text"
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  clearError();
                }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={loading}
                placeholder=" "
                className={`peer h-[58px] w-full rounded-lg border bg-white px-4 pb-1 pt-5 text-[16px] text-[#1c1e21] outline-none transition-all ${
                  accountNotFound
                    ? "border-[#e41e3f] focus:border-[#e41e3f] focus:ring-2 focus:ring-[#e41e3f]/10"
                    : "border-[#ccd0d5] focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/10"
                }`}
              />

              <label
                htmlFor="recovery-identifier"
                className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 bg-white px-1 text-[16px] transition-all duration-150 peer-focus:top-0 peer-focus:text-[12px] peer-focus:font-semibold ${
                  identifier
                    ? "top-0 text-[12px]"
                    : ""
                } ${
                  accountNotFound
                    ? "text-[#e41e3f]"
                    : "text-[#65676b] peer-focus:text-[#1877f2]"
                }`}
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
            className="mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#1877f2] text-[16px] font-bold text-white transition-all duration-150 hover:bg-[#166fe5] hover:shadow-md active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
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

      {/* =================================================
          ACCOUNT FOUND
      ================================================== */}

      {step === "account" && account && (
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
            Choose how you'd like to continue.
          </p>

          {/* Account */}
          <div className="mt-6 rounded-xl border border-[#e4e6eb] bg-[#f7f8fa] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e7f3ff] text-[#1877f2]">
                {account.maskedMobile ? (
                  <PhoneIcon />
                ) : (
                  <MailIcon />
                )}
              </div>

              <div className="min-w-0">
  <p className="text-[13px] font-medium text-[#65676b]">
    Your account
  </p>

  {account.maskedMobile && (
    <p className="text-[16px] font-semibold tracking-[0.2px] text-[#1c1e21]">
      {account.maskedMobile}
    </p>
  )}

  {account.maskedEmail && (
    <p className="truncate text-[14px] text-[#65676b]">
      {account.maskedEmail}
    </p>
  )}

  {!account.maskedMobile &&
    !account.maskedEmail && (
      <p className="text-[14px] text-[#65676b]">
        Account verified
      </p>
    )}
</div>
            </div>
          </div>

          {/* Password option */}
          <button
            type="button"
            onClick={() => {
              setSelectedMethod("password");
              clearError();
            }}
            className={`mt-5 flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              selectedMethod === "password"
                ? "border-[#1877f2] bg-[#f0f6ff] shadow-sm"
                : "border-[#ccd0d5] bg-white hover:bg-[#f7f8fa]"
            }`}
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                selectedMethod === "password"
                  ? "border-[#1877f2]"
                  : "border-[#8a8d91]"
              }`}
            >
              {selectedMethod === "password" && (
                <span className="h-2.5 w-2.5 rounded-full bg-[#1877f2]" />
              )}
            </div>

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                selectedMethod === "password"
                  ? "bg-[#dcecff] text-[#1877f2]"
                  : "bg-[#f0f2f5] text-[#65676b]"
              }`}
            >
              <KeyIcon />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[#1c1e21]">
                Continue with password
              </p>

              <p className="mt-0.5 text-[13px] text-[#65676b]">
                Use your password to continue
              </p>
            </div>
          </button>

          {/* Email option */}
          {account.maskedEmail && (
            <button
              type="button"
              onClick={() => {
                setSelectedMethod("email");
                clearError();
              }}
              className={`mt-3 flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                selectedMethod === "email"
                  ? "border-[#1877f2] bg-[#f0f6ff] shadow-sm"
                  : "border-[#ccd0d5] bg-white hover:bg-[#f7f8fa]"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  selectedMethod === "email"
                    ? "border-[#1877f2]"
                    : "border-[#8a8d91]"
                }`}
              >
                {selectedMethod === "email" && (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1877f2]" />
                )}
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  selectedMethod === "email"
                    ? "bg-[#dcecff] text-[#1877f2]"
                    : "bg-[#f0f2f5] text-[#65676b]"
                }`}
              >
                <MailIcon />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#1c1e21]">
                  Send code to email
                </p>

                <p className="mt-0.5 truncate text-[13px] text-[#65676b]">
                  {account.maskedEmail}
                </p>
              </div>
            </button>
          )}

          {/* Mobile option */}
          {account.maskedMobile && (
            <button
              type="button"
              onClick={() => {
                setSelectedMethod("mobile");
                clearError();
              }}
              className={`mt-3 flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                selectedMethod === "mobile"
                  ? "border-[#1877f2] bg-[#f0f6ff] shadow-sm"
                  : "border-[#ccd0d5] bg-white hover:bg-[#f7f8fa]"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  selectedMethod === "mobile"
                    ? "border-[#1877f2]"
                    : "border-[#8a8d91]"
                }`}
              >
                {selectedMethod === "mobile" && (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1877f2]" />
                )}
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  selectedMethod === "mobile"
                    ? "bg-[#dcecff] text-[#1877f2]"
                    : "bg-[#f0f2f5] text-[#65676b]"
                }`}
              >
                <PhoneIcon />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#1c1e21]">
                  Send code to mobile
                </p>

                <p className="mt-0.5 text-[13px] text-[#65676b]">
                  {account.maskedMobile}
                </p>
              </div>
            </button>
          )}

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
            onClick={handleMethodContinue}
            disabled={loading}
            className="mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#1877f2] text-[16px] font-bold text-white transition-all duration-150 hover:bg-[#166fe5] hover:shadow-md active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
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

      {/* =================================================
          PASSWORD
      ================================================== */}

      {step === "loginPassword" && (
        <form
          onSubmit={handleVerifyRecoveryPassword}
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
            <LockIcon />
          </div>

          <h1 className="mt-5 text-center text-[24px] font-bold tracking-[-0.3px] text-[#1c1e21]">
            Enter your password
          </h1>

          <p className="mx-auto mt-2 max-w-[390px] text-center text-[15px] leading-6 text-[#65676b]">
            Use your Smartprix password to continue to your account.
          </p>

          <div className="mt-7">
            <div className="relative">
              <input
                id="recovery-password"
                name="recovery_password"
                type={
                  showLoginPassword
                    ? "text"
                    : "password"
                }
                value={loginPassword}
                onChange={(event) => {
                  setLoginPassword(
                    event.target.value,
                  );

                  if (error) {
                    setError("");
                  }
                }}
                autoComplete="current-password"
                placeholder=" "
                disabled={loading}
                autoFocus
                className="peer h-[58px] w-full rounded-lg border border-[#ccd0d5] bg-white px-4 pb-1 pt-5 pr-12 text-[16px] text-[#1c1e21] outline-none transition-all focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/10"
              />

              <label
                htmlFor="recovery-password"
                className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 bg-white px-1 text-[16px] text-[#65676b] transition-all duration-150 peer-focus:top-0 peer-focus:text-[12px] peer-focus:font-semibold peer-focus:text-[#1877f2] ${
                  loginPassword
                    ? "top-0 text-[12px]"
                    : ""
                }`}
              >
                Password
              </label>

              <button
                type="button"
                onClick={() =>
                  togglePassword("login")
                }
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#65676b] transition-colors hover:bg-[#f0f2f5] hover:text-[#1877f2]"
                aria-label={
                  showLoginPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <span
                  className={`flex items-center justify-center transition-transform duration-180 ease-out ${
                    eyeAnimating === "login"
                      ? "scale-75"
                      : "scale-100"
                  }`}
                >
                  <EyeIcon
                    off={!showLoginPassword}
                  />
                </span>
              </button>
            </div>
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
            disabled={loading || !loginPassword}
            className="mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#1877f2] text-[16px] font-bold text-white transition-all duration-150 hover:bg-[#166fe5] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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

          <button
            type="button"
            onClick={() => {
              clearError();
              setLoginPassword("");
              setStep("account");
            }}
            className="mt-4 w-full text-center text-[14px] font-semibold text-[#1877f2] hover:underline"
          >
            Try another way
          </button>
        </form>
      )}

      {/* =================================================
          VERIFICATION CODE
      ================================================== */}

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
              {recoveryDestination}
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
              className="h-[58px] w-full rounded-lg border border-[#ccd0d5] bg-white text-center text-[25px] font-bold tracking-[10px] text-[#1c1e21] outline-none transition-all focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/10"
              placeholder="------"
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-[13px]">
            <span className="text-[#65676b]">
              {codeTimer > 0
                ? `Code expires in ${formatTimer(
                    codeTimer,
                  )}`
                : "Code has expired"}
            </span>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={
                resendTimer > 0 || loading
              }
              className={`font-semibold ${
                resendTimer > 0 || loading
                  ? "cursor-not-allowed text-[#bcc0c4]"
                  : "text-[#1877f2] hover:underline"
              }`}
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
              loading || code.length !== 6
            }
            className="mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#1877f2] text-[16px] font-bold text-white transition-all duration-150 hover:bg-[#166fe5] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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

      {/* =================================================
          NEW PASSWORD
      ================================================== */}

      {step === "newPassword" && (
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
            Choose a strong password that you don't use anywhere else.
          </p>

          {/* New password */}
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
                className="peer h-[58px] w-full rounded-lg border border-[#ccd0d5] bg-white px-4 pb-1 pt-5 pr-12 text-[16px] text-[#1c1e21] outline-none transition-all focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/10"
              />

              <label
                htmlFor="new-password"
                className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 bg-white px-1 text-[16px] text-[#65676b] transition-all duration-150 peer-focus:top-0 peer-focus:text-[12px] peer-focus:font-semibold peer-focus:text-[#1877f2] ${
                  password
                    ? "top-0 text-[12px]"
                    : ""
                }`}
              >
                New password
              </label>

              <button
                type="button"
                onClick={() =>
                  togglePassword("password")
                }
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#65676b] transition-colors hover:bg-[#f0f2f5] hover:text-[#1877f2]"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <span
                  className={`flex items-center justify-center transition-transform duration-180 ease-out ${
                    eyeAnimating === "password"
                      ? "scale-75"
                      : "scale-100"
                  }`}
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
                        className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
                          bar <= strength.score
                            ? "bg-[#1877f2]"
                            : "bg-[#e4e6eb]"
                        }`}
                      />
                    ),
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[12px] text-[#65676b]">
                    Use 8+ characters with uppercase,
                    numbers and symbols.
                  </span>

                  <span
                    className={`shrink-0 text-[12px] font-bold ${
                      strength.label === "Strong"
                        ? "text-[#31a24c]"
                        : strength.label === "Good"
                          ? "text-[#1877f2]"
                          : "text-[#e41e3f]"
                    }`}
                  >
                    {strength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm password */}
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
                className={`peer h-[58px] w-full rounded-lg border bg-white px-4 pb-1 pt-5 pr-12 text-[16px] text-[#1c1e21] outline-none transition-all ${
                  confirmPassword &&
                  !passwordsMatch
                    ? "border-[#e41e3f]"
                    : "border-[#ccd0d5] focus:border-[#1877f2]"
                } focus:ring-2 focus:ring-[#1877f2]/10`}
              />

              <label
                htmlFor="confirm-password"
                className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 bg-white px-1 text-[16px] text-[#65676b] transition-all duration-150 peer-focus:top-0 peer-focus:text-[12px] peer-focus:font-semibold peer-focus:text-[#1877f2] ${
                  confirmPassword
                    ? "top-0 text-[12px]"
                    : ""
                }`}
              >
                Confirm new password
              </label>

              <button
                type="button"
                onClick={() =>
                  togglePassword("confirm")
                }
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#65676b] transition-colors hover:bg-[#f0f2f5] hover:text-[#1877f2]"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <span
                  className={`flex items-center justify-center transition-transform duration-180 ease-out ${
                    eyeAnimating === "confirm"
                      ? "scale-75"
                      : "scale-100"
                  }`}
                >
                  <EyeIcon
                    off={!showConfirmPassword}
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
            className="mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#1877f2] text-[16px] font-bold text-white transition-all duration-150 hover:bg-[#166fe5] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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

      {/* =================================================
          SUCCESS
      ================================================== */}

      {step === "success" && (
        <div className="px-7 pb-9 pt-9 text-center sm:px-9">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e7f7ed] text-[#31a24c]">
            <CheckIcon />
          </div>

          <h1 className="mt-6 text-[25px] font-bold tracking-[-0.4px] text-[#1c1e21]">
            Password updated!
          </h1>

          <p className="mx-auto mt-3 max-w-[370px] text-[15px] leading-6 text-[#65676b]">
            Your Smartprix password has been changed successfully.
            You can now log in with your new password.
          </p>

          <Link
            href="/login"
            className="mt-7 flex h-[50px] w-full items-center justify-center rounded-full bg-[#1877f2] text-[16px] font-bold text-white transition-all duration-150 hover:bg-[#166fe5] hover:shadow-md active:scale-[0.98]"
          >
            Log in
          </Link>
        </div>
      )}
    </section>

    {/* Footer */}
    <p className="mt-7 text-center text-[12px] text-[#8a8d91]">
      Smartprix helps you discover, compare and choose the right
      products.
    </p>
  </div>
</main>

);
}
