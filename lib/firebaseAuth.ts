import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase";

/* =========================================================
   EMAIL / PASSWORD
========================================================= */

export async function firebaseEmailLogin(
  email: string,
  password: string,
) {
  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return result.user;
}

/* =========================================================
   RECAPTCHA
========================================================= */

export function setupRecaptcha(
  containerId: string,
): RecaptchaVerifier {
  if (typeof window === "undefined") {
    throw new Error(
      "reCAPTCHA can only run in the browser.",
    );
  }

  const existing = (
    window as typeof window & {
      recaptchaVerifier?: RecaptchaVerifier;
    }
  ).recaptchaVerifier;

  if (existing) {
    return existing;
  }

  const verifier = new RecaptchaVerifier(
    auth,
    containerId,
    {
      size: "invisible",
    },
  );

  (
    window as typeof window & {
      recaptchaVerifier?: RecaptchaVerifier;
    }
  ).recaptchaVerifier = verifier;

  return verifier;
}

/* =========================================================
   SEND PHONE OTP
========================================================= */

export async function sendPhoneOTP(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier,
) {
  return signInWithPhoneNumber(
    auth,
    phoneNumber,
    recaptchaVerifier,
  );
}

/* =========================================================
   VERIFY PHONE OTP
========================================================= */

export async function verifyPhoneOTP(
  confirmationResult: ConfirmationResult,
  otp: string,
) {
  const result =
    await confirmationResult.confirm(otp);

  return result.user;
}

/* =========================================================
   FIREBASE → SMARTPRIX BACKEND
========================================================= */

export async function loginToSmartprixWithFirebase() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "No Firebase user is signed in.",
    );
  }

  const idToken = await user.getIdToken();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api";

  const response = await fetch(
    `${API_URL}/auth/firebase`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Smartprix Firebase login failed.",
    );
  }

  localStorage.setItem(
    "smartprix_token",
    result.data.token,
  );

  if (result.data.user) {
    localStorage.setItem(
      "smartprix_user",
      JSON.stringify(result.data.user),
    );
  }

  return result.data;
}

/* =========================================================
   LOGOUT
========================================================= */

export async function firebaseLogout() {
  await signOut(auth);
}