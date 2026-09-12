import { apiFetch } from "@/lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  mobile: string | null;
  profileImageUrl: string | null;
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


export async function uploadProfileImage(
  file: File,
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
    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch(
      `${API_URL}/user/profile/image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          result.message ??
          "Failed to upload profile picture",
      };
    }

    if (result.success && result.data) {
      const existingUser =
        localStorage.getItem("smartprix_user");

      let previousUser: Record<string, unknown> = {};

      if (existingUser) {
        try {
          previousUser = JSON.parse(existingUser);
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

      window.dispatchEvent(
        new Event("smartprix-auth-changed"),
      );
    }

    return {
      success: result.success === true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error(
      "Upload profile image failed:",
      error,
    );

    return {
      success: false,
      message: "Unable to connect to the server",
    };
  }
}


export async function deleteProfileImage(): Promise<{
  success: boolean;
  message?: string;
  data?: {
    profileImageUrl: null;
  };
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
      `${API_URL}/user/profile/image`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          result.message ??
          "Failed to remove profile picture",
      };
    }

    if (result.success) {
      const existingUser =
        localStorage.getItem("smartprix_user");

      if (existingUser) {
        try {
          const previousUser =
            JSON.parse(existingUser);

          localStorage.setItem(
            "smartprix_user",
            JSON.stringify({
              ...previousUser,
              profileImageUrl: null,
            }),
          );
        } catch {
          // Ignore invalid localStorage data.
        }
      }

      window.dispatchEvent(
        new Event("smartprix-auth-changed"),
      );
    }

    return {
      success: result.success === true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error(
      "Delete profile image failed:",
      error,
    );

    return {
      success: false,
      message: "Unable to connect to the server",
    };
  }
}



/* =========================================================
   UPDATE PROFILE
========================================================= */

/* =========================================================
UPDATE PROFILE
========================================================= */

export async function updateUserProfile(
data: {
name: string;
email?: string;
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
`${API_URL}/auth/profile`,
{
method: "PATCH",
headers: {
"Content-Type": "application/json",
Accept: "application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({
name: data.name,
mobile: data.mobile,
dateOfBirth:
data.dateOfBirth || null,
gender:
data.gender || null,
}),
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
 * Keep local user information synchronized
 * with the database.
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

  /*
   * Tell Header and other authenticated
   * components that the user changed.
   */
  window.dispatchEvent(
    new Event(
      "smartprix-auth-changed",
    ),
  );
}

return {
  success:
    result.success === true,
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
          "Content-Type": "application/json",
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

export async function deleteUserAccount(
  currentPassword: string,
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
      `${API_URL}/user/account`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          result.message ??
          "Failed to delete account",
      };
    }

    return {
      success: result.success === true,
      message: result.message,
    };
  } catch (error) {
    console.error(
      "Delete account failed:",
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
   USER HISTORY
========================================================= */

export interface UserHistoryActor {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  profileImageUrl: string | null;
}

export interface UserHistoryLog {
  id: string;
  actorUserId: string | null;
  targetUserId: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: UserHistoryActor | null;
}

export interface UserHistoryStats {
  total: number;
  registered: number;
  logins: number;
  logouts: number;
  profileUpdates: number;
  profileImageUpdates: number;
  profileImageDeletes: number;
  deleted: number;
  adminActions: number;
}

export interface UserHistoryUser {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  role: string;
  isDisabled: boolean;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserHistoryResponse {
  success: boolean;
  message?: string;

  data?: {
    user: UserHistoryUser | null;
    logs: UserHistoryLog[];
    stats: UserHistoryStats;
  };
}

export async function getUserHistory(
  userId: string,
): Promise<UserHistoryResponse> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("smartprix_token")
      : null;

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api";

  const response = await fetch(
    `${API_URL}/admin/users/${encodeURIComponent(
      userId,
    )}/history`,
    {
      method: "GET",

      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      cache: "no-store",
    },
  );

  let result: UserHistoryResponse;

  try {
    result =
      (await response.json()) as UserHistoryResponse;
  } catch {
    throw new Error(
      "Invalid response from server",
    );
  }

  if (!response.ok) {
    throw new Error(
      result.message ??
        "Failed to load user history",
    );
  }

  return result;
}


