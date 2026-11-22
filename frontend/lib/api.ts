import type { ApiErrorBody, ApiResponse } from "@/types/api";
import type { User } from "@/types/user";
import type { Video, VideoDetail } from "@/types/video";
import type { ChannelProfile } from "@/types/channel";
import type { ThemePreference } from "@/lib/theme";

export class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const NO_REFRESH_PATHS = [
  "/api/v1/user/login",
  "/api/v1/user/register",
  "/api/v1/user/refresh-token",
];

// One shared refresh at a time
let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/v1/user/refresh-token", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function sendRequest(path: string, options?: RequestInit) {
  const headers =
    options?.body instanceof FormData
      ? undefined
      : { "Content-Type": "application/json" };

  const res = await fetch(path, {
    credentials: "include",
    headers,
    ...options,
  });
  const body = await res.json();
  return { res, body };
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  let result = await sendRequest(path, options);

  if (result.res.status === 401 && !NO_REFRESH_PATHS.includes(path)) {
    const refreshed = await refreshSession();
    if (refreshed) {
      result = await sendRequest(path, options);
    }
  }

  if (!result.res.ok) {
    throw new ApiClientError(
      result.res.status,
      (result.body as ApiErrorBody).message,
    );
  }

  return result.body as T;
}

type LoginInput = {
  email: string;
  password: string;
};
export function login(input: LoginInput) {
  return apiRequest<ApiResponse<{ user: User }>>("/api/v1/user/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function register(formData: FormData) {
  return apiRequest<ApiResponse<User>>("/api/v1/user/register", {
    method: "POST",
    body: formData,
  });
}

export function getCurrentUser() {
  return apiRequest<ApiResponse<User>>("/api/v1/user/current-user");
}

export function logout() {
  return apiRequest<ApiResponse<object>>("/api/v1/user/logout", {
    method: "POST",
  });
}

export function getVideos(
  params: {
    query?: string;
    userId?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 1));
  search.set("limit", String(params.limit ?? 12));
  if (params.query) {
    search.set("query", params.query);
  }
  if (params.userId) {
    search.set("userId", params.userId);
  }
  return apiRequest<ApiResponse<Video[]>>(`/api/v1/video?${search.toString()}`);
}

export function getVideoById(id: string) {
  return apiRequest<ApiResponse<VideoDetail>>(
    `/api/v1/video/${encodeURIComponent(id)}`,
  );
}

export function toggleVideoLike(videoId: string) {
  return apiRequest<ApiResponse<{ isLiked: boolean; likesCount: number }>>(
    `/api/v1/likes/toggle/v/${encodeURIComponent(videoId)}`,
    { method: "POST" },
  );
}

export function toggleSubscription(channelId: string) {
  return apiRequest<
    ApiResponse<{ isSubscribed: boolean; subscribersCount: number }>
  >(`/api/v1/subscriptions/c/${encodeURIComponent(channelId)}`, {
    method: "POST",
  });
}

import type { VideoComment, CreatedComment } from "@/types/comment";

export function getComments(videoId: string, page = 1, limit = 10) {
  return apiRequest<ApiResponse<VideoComment[]>>(
    `/api/v1/comments/video/${encodeURIComponent(videoId)}?page=${page}&limit=${limit}`,
  );
}

export function addComment(videoId: string, content: string) {
  return apiRequest<ApiResponse<CreatedComment>>(
    `/api/v1/comments/video/${encodeURIComponent(videoId)}`,
    { method: "POST", body: JSON.stringify({ content }) },
  );
}

export function deleteComment(commentId: string) {
  return apiRequest<ApiResponse<object>>(
    `/api/v1/comments/${encodeURIComponent(commentId)}`,
    { method: "DELETE" },
  );
}

export function getChannelProfile(userName: string) {
  return apiRequest<ApiResponse<ChannelProfile>>(
    `/api/v1/user/c/${encodeURIComponent(userName)}`,
  );
}

export function uploadVideo(
  formData: FormData,
  onProgress: (percent: number) => void,
) {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<ApiResponse<{ _id: string }>>(
    (resolve, reject) => {
      xhr.open("POST", "/api/v1/video");
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        let body: unknown = null;
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          // the response was not JSON
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(body as ApiResponse<{ _id: string }>);
        } else {
          const message =
            (body as ApiErrorBody | null)?.message ?? "Upload failed";
          reject(new ApiClientError(xhr.status, message));
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.onabort = () => reject(new DOMException("Cancelled", "AbortError"));

      xhr.send(formData);
    },
  );

  return { promise, abort: () => xhr.abort() };
}

export function updateTheme(theme: ThemePreference) {
  return apiRequest<ApiResponse<User>>("/api/v1/user/theme", {
    method: "PATCH",
    body: JSON.stringify({ theme }),
  });
}
