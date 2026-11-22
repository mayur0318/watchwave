import type { ThemePreference } from "@/lib/theme";
export interface User {
  _id: string;
  userName: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage: string;
  watchHistory: unknown[];
  createdAt: string;
  updatedAt: string;
  theme: ThemePreference;
}
