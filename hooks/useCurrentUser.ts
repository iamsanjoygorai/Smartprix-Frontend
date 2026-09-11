"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getUserProfile,
  type UserProfile,
} from "@/lib/api/user";

export function useCurrentUser() {
  return useQuery<UserProfile | null>({
    queryKey: ["current-user"],

    queryFn: async () => {
      const response = await getUserProfile();

      if (!response.success || !response.data) {
        return null;
      }

      return response.data;
    },

    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}