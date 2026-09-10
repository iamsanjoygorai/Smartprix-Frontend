const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  mobile: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  role: string;
  isDisabled: boolean;
  createdAt: string;
  updatedAt: string;

    stats: {
    reviews: number;
    favorites: number;
    comparisons: number;
    priceAlerts: number;
  };
}

interface ProfileResponse {
  success?: boolean;
  message?: string;
  data?: UserProfile;
}

interface UpdateProfileResponse {
  success?: boolean;
  message?: string;
  data?: UserProfile;
}

interface ChangePasswordResponse {
  success?: boolean;
  message?: string;
}

/* =========================================================
   AUTH TOKEN
========================================================= */

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    "smartprix_token",
  );
}

/* =========================================================
   GET PROFILE
========================================================= */

export async function getUserProfile(): Promise<{
  success: boolean;
  message?: string;
  data?: UserProfile;
}> {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Authentication required",
    };
  }

  try {
    const response = await fetch(
      `${API_URL}/user/profile`,
      {
        method: "GET",

        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },

        cache: "no-store",
      },
    );

    const result =
      (await response.json()) as ProfileResponse;

    if (!response.ok) {
      return {
        success: false,
        message:
          result.message ??
          "Failed to fetch profile",
      };
    }

    return {
      success: result.success === true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error(
      "Get user profile failed:",
      error,
    );

    return {
      success: false,
      message:
        "Unable to connect to the server",
    };
  }
}

/* =========================================================
   UPDATE PROFILE
========================================================= */

export async function updateUserProfile(
  data: {
    name: string;
    email: string;
    mobile: string;
    dateOfBirth: string;
    gender: string;
  },
): Promise<{
  success: boolean;
  message?: string;
  data?: UserProfile;
}> {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Authentication required",
    };
  }

  try {
    const response = await fetch(
      `${API_URL}/user/profile`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(data),
      },
    );

    const result =
      (await response.json()) as UpdateProfileResponse;

    if (!response.ok) {
      return {
        success: false,
        message:
          result.message ??
          "Failed to update profile",
      };
    }

    /*
     * Keep the local user information
     * synchronized with the database.
     */
    if (
      result.success &&
      result.data
    ) {
      const existingUser =
        localStorage.getItem(
          "smartprix_user",
        );

      let previousUser: Record<
        string,
        unknown
      > = {};

      if (existingUser) {
        try {
          previousUser =
            JSON.parse(existingUser);
        } catch {
          previousUser = {};
        }
      }

      localStorage.setItem(
        "smartprix_user",
        JSON.stringify({
          ...previousUser,
          ...result.data,
        }),
      );
    }

    return {
      success: result.success === true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error(
      "Update user profile failed:",
      error,
    );

    return {
      success: false,
      message:
        "Unable to connect to the server",
    };
  }
}

/* =========================================================
   CHANGE PASSWORD
========================================================= */

export async function changeUserPassword(
  data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  },
): Promise<{
  success: boolean;
  message?: string;
}> {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Authentication required",
    };
  }

  try {
    const response = await fetch(
      `${API_URL}/user/password`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(data),
      },
    );

    const result =
      (await response.json()) as ChangePasswordResponse;

    if (!response.ok) {
      return {
        success: false,
        message:
          result.message ??
          "Failed to change password",
      };
    }

    return {
      success: result.success === true,
      message: result.message,
    };
  } catch (error) {
    console.error(
      "Change password failed:",
      error,
    );

    return {
      success: false,
      message:
        "Unable to connect to the server",
    };
  }
}