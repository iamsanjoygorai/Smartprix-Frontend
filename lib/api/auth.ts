import { apiFetch } from "./client";

/* =========================================================
   LOGIN
========================================================= */

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface LoginUser {
  id?: string;
  name?: string | null;
  email?: string;
  mobile?: string | null;
  role?: string;
  permissions?: string[];
  isAdmin?: boolean;
}

export interface LoginResult {
  token?: string;
  user?: LoginUser;
}

export async function login(
  input: LoginInput,
) {
  return apiFetch<{
    success: boolean;
    message?: string;
    data?: LoginResult;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      identifier: input.identifier.trim(),
      password: input.password,
    }),
  });
}

/* =========================================================
   FORGOT PASSWORD
========================================================= */

export interface ForgotPasswordInput {
  identifier: string;
}

export async function forgotPassword(
  input: ForgotPasswordInput,
) {
  return apiFetch<{
    success: boolean;
    message: string;
  }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({
      identifier: input.identifier.trim(),
    }),
  });
}

/* =========================================================
   RESET PASSWORD
========================================================= */

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
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