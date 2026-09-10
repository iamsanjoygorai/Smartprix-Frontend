"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: {
      id: string;
      email: string;
      name?: string;
      role: string;
      permissions: string[];
    };
  };
}

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

/* =========================================================
   FLOATING INPUT
========================================================= */



function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  disabled = false,
  autoComplete = "off",
  rightElement,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoComplete?: string;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder=" "
        autoComplete={autoComplete}
        disabled={disabled}
        className="
          peer
          h-[58px]
          w-full
          rounded-md
          border
          border-[#ccd0d5]
          bg-white
          px-4
          pb-2
          pt-6
          text-[16px]
          text-[#1c1e21]
          outline-none
          transition-all
          duration-150
          placeholder:text-transparent
          hover:border-[#b7b9bd]
          focus:border-[#1877f2]
          focus:ring-1
          focus:ring-[#1877f2]
          disabled:cursor-not-allowed
          disabled:bg-[#f5f6f7]
        "
      />

      <label
        htmlFor={id}
        className="
          pointer-events-none
          absolute
          left-4
          top-1/2
          z-10
          -translate-y-1/2
          text-[16px]
          text-[#65676b]
          transition-all
          duration-150
          peer-focus:top-2
          peer-focus:translate-y-0
          peer-focus:text-[12px]
          peer-focus:text-[#1877f2]
          peer-[:not(:placeholder-shown)]:top-2
          peer-[:not(:placeholder-shown)]:translate-y-0
          peer-[:not(:placeholder-shown)]:text-[12px]
        "
      >
        {label}
      </label>

      {rightElement}
    </div>
  );
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
        {/* Eye */}
        <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" />

        {/* Eye pupil */}
        <circle cx="12" cy="12" r="3" />

        {/* Cross: bottom-left → top-right */}
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


/* =========================================================
   REGISTER PAGE
========================================================= */

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [gender, setGender] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eyeAnimating, setEyeAnimating] = useState(false);
  const [showDobInfo, setShowDobInfo] = useState(false);

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }

    if (!lastName.trim()) {
      setError("Please enter your last name.");
      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter your mobile number or email address.",
      );
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Your password must contain at least 6 characters.",
      );
      return;
    }

    if (!day || !month || !year) {
      setError("Please select your date of birth.");
      return;
    }

    if (!gender) {
      setError("Please select your gender.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `${firstName.trim()} ${lastName.trim()}`,
            email: email.trim(),
            password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dateOfBirth: `${year}-${month.padStart(
              2,
              "0",
            )}-${day.padStart(2, "0")}`,
            gender,
          }),
        },
      );

      const responseData: RegisterResponse =
        await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(
          responseData.message ||
            "Unable to create your account.",
        );
      }

      /* =====================================================
         AUTO LOGIN IF API RETURNS TOKEN
      ===================================================== */

      if (
        responseData.data?.token &&
        responseData.data?.user
      ) {
        const { token, user } = responseData.data;

        localStorage.setItem(
          "smartprix_token",
          token,
        );

        localStorage.setItem(
          "smartprix_user",
          JSON.stringify(user),
        );

        const isAdminUser =
          user.role === "ADMIN" ||
          user.role === "SUPER_ADMIN" ||
          user.role === "EDITOR";

        router.replace(
          isAdminUser ? "/admin" : "/",
        );
      } else {
        router.replace("/login?registered=true");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f0f2f5] px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-[432px]">

        {/* ===================================================
            SMARTPRIX BRAND
        =================================================== */}

        <div className="mb-5 text-center">
          <Link
            href="/"
            className="
              inline-block
              text-[40px]
              font-extrabold
              tracking-[-2.5px]
              text-[#1877f2]
              transition
              hover:opacity-90
              sm:text-[44px]
            "
          >
            Smartprix
          </Link>
        </div>

        {/* ===================================================
            REGISTRATION CARD
        =================================================== */}

        <section
          className="
            overflow-hidden
            rounded-lg
            bg-white
            shadow-[0_2px_12px_rgba(0,0,0,0.12)]
          "
        >
          {/* =================================================
              CARD TITLE
          ================================================= */}

          <div
            className="
              border-b
              border-[#dadde1]
              px-5
              py-5
              text-center
              sm:px-6
            "
          >
            <h1
              className="
                text-[26px]
                font-bold
                leading-8
                text-[#1c1e21]
              "
            >
              Create new account
            </h1>

            <p className="mt-1 text-[15px] text-[#606770]">
              It&apos;s quick and easy.
            </p>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="px-5 pb-6 pt-5 sm:px-6"
          >
            <div className="space-y-3">

              {/* =============================================
                  FIRST + LAST NAME
              ============================================= */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FloatingInput
                  id="firstName"
                  label="First name"
                  value={firstName}
                  onChange={setFirstName}
                  disabled={loading}
                  autoComplete="off"
                />

                <FloatingInput
                  id="lastName"
                  label="Last name"
                  value={lastName}
                  onChange={setLastName}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              {/* =============================================
                  EMAIL / MOBILE
              ============================================= */}

              <FloatingInput
                id="email"
                label="Mobile number or email address"
                value={email}
                onChange={setEmail}
                disabled={loading}
                autoComplete="off"
              />

              {/* =============================================
                  PASSWORD
              ============================================= */}

              <FloatingInput
                id="password"
                label="Password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={setPassword}
                disabled={loading}
                autoComplete="new-password"
               rightElement={
  <button
    type="button"
    onClick={() =>
      setShowPassword((value) => !value)
    }
    aria-label={
      showPassword
        ? "Hide password"
        : "Show password"
    }
    title={
      showPassword
        ? "Hide password"
        : "Show password"
    }
    className="
      absolute
      right-3
      top-1/2
      flex
      h-9
      w-9
      -translate-y-1/2
      items-center
      justify-center
      rounded-full
      text-[#65676b]
      transition
      hover:bg-[#f0f2f5]
      hover:text-[#1877f2]
    "
  >
    <EyeIcon off={!showPassword} />
  </button>
}
              />

              {/* =============================================
                  DATE OF BIRTH
              ============================================= */}

              <div className="pt-1">
                <div className="mb-2 flex items-center gap-1.5">
                  <span
                    className="
                      text-[12px]
                      font-semibold
                      text-[#606770]
                    "
                  >
                    Date of birth
                  </span>

                  <span
                    title="Choose your date of birth"
                    className="
                      flex
                      h-[15px]
                      w-[15px]
                      items-center
                      justify-center
                      rounded-full
                      bg-[#606770]
                      text-[10px]
                      font-bold
                      leading-none
                      text-white
                    "
                  >
                    i
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">

                  {/* DAY */}

                  <select
                    value={day}
                    onChange={(event) =>
                      setDay(event.target.value)
                    }
                    disabled={loading}
                    className="
                      h-[44px]
                      w-full
                      rounded-md
                      border
                      border-[#ccd0d5]
                      bg-white
                      px-3
                      text-[15px]
                      text-[#1c1e21]
                      outline-none
                      transition
                      focus:border-[#1877f2]
                      focus:ring-1
                      focus:ring-[#1877f2]
                      disabled:bg-[#f5f6f7]
                    "
                  >
                    <option value="">
                      Day
                    </option>

                    {Array.from(
                      { length: 31 },
                      (_, index) => {
                        const value = String(
                          index + 1,
                        );

                        return (
                          <option
                            key={value}
                            value={value}
                          >
                            {value}
                          </option>
                        );
                      },
                    )}
                  </select>

                  {/* MONTH */}

                  <select
                    value={month}
                    onChange={(event) =>
                      setMonth(event.target.value)
                    }
                    disabled={loading}
                    className="
                      h-[44px]
                      w-full
                      rounded-md
                      border
                      border-[#ccd0d5]
                      bg-white
                      px-3
                      text-[15px]
                      text-[#1c1e21]
                      outline-none
                      transition
                      focus:border-[#1877f2]
                      focus:ring-1
                      focus:ring-[#1877f2]
                      disabled:bg-[#f5f6f7]
                    "
                  >
                    <option value="">
                      Month
                    </option>

                    {months.map((item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>

                  {/* YEAR */}

                  <select
                    value={year}
                    onChange={(event) =>
                      setYear(event.target.value)
                    }
                    disabled={loading}
                    className="
                      h-[44px]
                      w-full
                      rounded-md
                      border
                      border-[#ccd0d5]
                      bg-white
                      px-3
                      text-[15px]
                      text-[#1c1e21]
                      outline-none
                      transition
                      focus:border-[#1877f2]
                      focus:ring-1
                      focus:ring-[#1877f2]
                      disabled:bg-[#f5f6f7]
                    "
                  >
                    <option value="">
                      Year
                    </option>

                    {Array.from(
                      { length: 100 },
                      (_, index) =>
                        new Date().getFullYear() -
                        index,
                    ).map((value) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* =============================================
                  GENDER
              ============================================= */}

              <div className="pt-1">
                <div className="mb-2 flex items-center gap-1.5">
                  <span
                    className="
                      text-[12px]
                      font-semibold
                      text-[#606770]
                    "
                  >
                    Gender
                  </span>

                  <span
                    title="Select your gender"
                    className="
                      flex
                      h-[15px]
                      w-[15px]
                      items-center
                      justify-center
                      rounded-full
                      bg-[#606770]
                      text-[10px]
                      font-bold
                      leading-none
                      text-white
                    "
                  >
                    i
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    "Female",
                    "Male",
                    "Other",
                  ].map((item) => (
                    <label
                      key={item}
                      className={`
                        flex
                        h-[44px]
                        cursor-pointer
                        items-center
                        justify-between
                        rounded-md
                        border
                        px-3
                        text-[15px]
                        transition
                        ${
                          gender === item
                            ? "border-[#1877f2] bg-[#f0f7ff]"
                            : "border-[#ccd0d5] bg-white hover:bg-[#f5f6f7]"
                        }
                      `}
                    >
                      <span className="text-[#1c1e21]">
                        {item}
                      </span>

                      <input
                        type="radio"
                        name="gender"
                        value={item}
                        checked={
                          gender === item
                        }
                        onChange={(event) =>
                          setGender(
                            event.target.value,
                          )
                        }
                        disabled={loading}
                        className="h-4 w-4 accent-[#1877f2]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* =============================================
                  TERMS
              ============================================= */}

              <div className="pt-1">
                <p
                  className="
                    text-[11px]
                    leading-[15px]
                    text-[#777]
                  "
                >
                  By clicking Create account, you
                  agree to our{" "}
                  <Link
                    href="/terms"
                    className="
                      font-medium
                      text-[#385898]
                      hover:underline
                    "
                  >
                    Terms
                  </Link>
                  ,{" "}
                  <Link
                    href="/privacy"
                    className="
                      font-medium
                      text-[#385898]
                      hover:underline
                    "
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/cookies"
                    className="
                      font-medium
                      text-[#385898]
                      hover:underline
                    "
                  >
                    Cookies Policy
                  </Link>
                  .
                </p>
              </div>

              {/* =============================================
                  ERROR
              ============================================= */}

              {error && (
                <div
                  className="
                    rounded-md
                    border
                    border-[#f5c2c7]
                    bg-[#fff5f5]
                    px-4
                    py-3
                    text-[14px]
                    leading-5
                    text-[#b42318]
                  "
                >
                  {error}
                </div>
              )}

              {/* =============================================
                  CREATE ACCOUNT
              ============================================= */}

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    h-[48px]
                    min-w-[190px]
                    rounded-md
                    bg-[#42b72a]
                    px-7
                    text-[17px]
                    font-bold
                    text-white
                    transition
                    hover:bg-[#36a420]
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading
                    ? "Creating account..."
                    : "Create new account"}
                </button>
              </div>

              {/* =============================================
                  LOGIN
              ============================================= */}

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="
                    text-[15px]
                    font-semibold
                    text-[#1877f2]
                    hover:underline
                  "
                >
                  Already have an account?
                </Link>
              </div>
            </div>
          </form>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <p
          className="
            mt-6
            text-center
            text-[12px]
            text-[#65676b]
          "
        >
          © {new Date().getFullYear()} Smartprix
        </p>
      </div>
    </main>
  );
}
