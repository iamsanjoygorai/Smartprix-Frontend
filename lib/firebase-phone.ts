"use client";

import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import { auth } from "./firebase";

let recaptchaVerifier: RecaptchaVerifier | null = null;

export function setupRecaptcha(containerId: string) {
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    containerId,
    {
      size: "invisible",
    },
  );

  return recaptchaVerifier;
}

export async function sendFirebaseOtp(
  phoneNumber: string,
  containerId: string,
): Promise<ConfirmationResult> {
  const verifier = setupRecaptcha(containerId);

  const confirmationResult =
    await signInWithPhoneNumber(
      auth,
      phoneNumber,
      verifier,
    );

  return confirmationResult;
}

export async function verifyFirebaseOtp(
  confirmationResult: ConfirmationResult,
  code: string,
) {
  const result =
    await confirmationResult.confirm(code);

  return result.user;
}

export function clearFirebaseRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}