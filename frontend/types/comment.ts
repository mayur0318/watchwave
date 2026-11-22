import type { VideoOwner } from "@/types/video";

export interface VideoComment {
  _id: string;
  content: string;
  video: string;
  owner: VideoOwner | null;
  createdAt: string;
  updatedAt: string;
}

// What the server returns right after creating a comment:
// the owner is only an id, not the full object
export interface CreatedComment {
  _id: string;
  content: string;
  video: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}
