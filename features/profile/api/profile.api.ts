import { apiFetch } from "@/lib/api";

/* =========================================================
TYPES
========================================================= */

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

interface ApiResponse<T = unknown> {
success?: boolean;
message?: string;
data?: T;
}

/* =========================================================
LOCAL USER SYNC
========================================================= */

function syncLocalUser(user: Partial<UserProfile>) {
if (typeof window === "undefined") {
return;
}

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
...user,
}),
);

window.dispatchEvent(
new Event("smartprix-auth-changed"),
);
}

/* =========================================================
GET PROFILE
========================================================= */

export async function getUserProfile(): Promise<
  ApiResponse<UserProfile>
> {
  try {
    const response = await apiFetch(
      "/user/profile",
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const result =
      (await response.json()) as ApiResponse<UserProfile>;

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

export async function updateUserProfile(data: {
name: string;
email?: string;
mobile: string;
dateOfBirth: string;
gender: string;
}): Promise<ApiResponse<UserProfile>> {
try {
const response = await apiFetch(
"/auth/profile",
{
method: "PATCH",
headers: {
"Content-Type": "application/json",
Accept: "application/json",
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
  (await response.json()) as ApiResponse<UserProfile>;

if (!response.ok) {
  return {
    success: false,
    message:
      result.message ??
      "Failed to update profile",
  };
}

if (
  result.success &&
  result.data
) {
  syncLocalUser(result.data);
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
UPLOAD PROFILE IMAGE
========================================================= */

export async function uploadProfileImage(
file: File,
): Promise<ApiResponse<UserProfile>> {
try {
const formData = new FormData();

 
formData.append("image", file);

const response = await apiFetch(
  "/user/profile/image",
  {
    method: "POST",
    body: formData,
  },
);

const result =
  (await response.json()) as ApiResponse<UserProfile>;

if (!response.ok) {
  return {
    success: false,
    message:
      result.message ??
      "Failed to upload profile picture",
  };
}

if (
  result.success &&
  result.data
) {
  syncLocalUser(result.data);
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
  message:
    "Unable to connect to the server",
};
 

}
}

/* =========================================================
DELETE PROFILE IMAGE
========================================================= */

export async function deleteProfileImage(): Promise<
  ApiResponse<{
    profileImageUrl: null;
  }>
> {
  try {
    const response = await apiFetch(
      "/user/profile/image",
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      },
    );

    const result =
      (await response.json()) as ApiResponse<{
        profileImageUrl: null;
      }>;

    if (!response.ok) {
      return {
        success: false,
        message:
          result.message ??
          "Failed to remove profile picture",
      };
    }

    if (result.success) {
      syncLocalUser({
        profileImageUrl: null,
      });
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
      message:
        "Unable to connect to the server",
    };
  }
}

/* =========================================================
CHANGE PASSWORD
========================================================= */

export async function changeUserPassword(data: {
currentPassword: string;
newPassword: string;
confirmPassword: string;
}): Promise<ApiResponse> {
try {
const response = await apiFetch(
"/user/password",
{
method: "PUT",
headers: {
"Content-Type": "application/json",
Accept: "application/json",
},
body: JSON.stringify(data),
},
);

 
const result =
  (await response.json()) as ApiResponse;

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

/* =========================================================
DELETE ACCOUNT
========================================================= */

export async function deleteUserAccount(): Promise<ApiResponse> {
try {
/*
* Account deletion is handled by the new
* modular backend account module.
*
* Backend:
* DELETE /api/profile/account
*/

 
const response = await apiFetch(
  "/profile/account",
  {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  },
);

const result =
  (await response.json()) as ApiResponse;

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
