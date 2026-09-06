import { apiFetch } from "./client";

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export async function forgotPassword(
  input: ForgotPasswordInput,
) {
  return apiFetch<{
    success: boolean;
    message: string;
  }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resetPassword(
  input: ResetPasswordInput,
) {
  return apiFetch<{
    success: boolean;
    message: string;
  }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}