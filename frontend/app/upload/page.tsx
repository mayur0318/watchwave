"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/FormInput";
import { getCurrentUser, uploadVideo, ApiClientError } from "@/lib/api";
import { validateUpload, type UploadErrors } from "@/lib/validators";

const fileClasses =
  "text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-700 file:px-3 file:py-1 file:text-white hover:file:bg-cyan-600";

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [errors, setErrors] = useState<UploadErrors>({});
  const [serverError, setServerError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const abortRef = useRef<(() => void) | null>(null);
  const [formKey, setFormKey] = useState(0);

  const isUploading = progress !== null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    const result = validateUpload({ title, description, videoFile, thumbnail });
    setErrors(result);
    if (Object.keys(result).length > 0 || !videoFile || !thumbnail) {
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnail);

    setProgress(0);
    try {
      // makes sure the session is fresh before a long upload
      await getCurrentUser();

      const { promise, abort } = uploadVideo(formData, setProgress);
      abortRef.current = abort;
      const res = await promise;

      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnail(null);
      setErrors({});
      setProgress(null);
      setFormKey((k) => k + 1);

      router.push(`/watch/${res.data._id}`);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setServerError("Upload cancelled.");
      } else if (error instanceof ApiClientError) {
        setServerError(error.message);
      } else {
        setServerError("Upload failed. Please check your connection.");
      }
      setProgress(null);
    } finally {
      abortRef.current = null;
    }
  }

  return (
    <main className="flex items-center justify-center px-4 py-10">
      <form
        key={formKey}
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-lg flex-col gap-4"
      >
        <h1 className="text-3xl font-bold">Upload a video</h1>

        <FormInput
          id="title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="rounded border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="videoFile" className="text-sm text-gray-300">
            Video file (up to 100 MB)
          </label>
          <input
            id="videoFile"
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            className={fileClasses}
          />
          {errors.videoFile && (
            <p className="text-sm text-red-500">{errors.videoFile}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="thumbnail" className="text-sm text-gray-300">
            Thumbnail image
          </label>
          <input
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
            className={fileClasses}
          />
          {errors.thumbnail && (
            <p className="text-sm text-red-500">{errors.thumbnail}</p>
          )}
        </div>

        {isUploading && (
          <div>
            <div
              role="progressbar"
              aria-label="Upload progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="h-2 w-full overflow-hidden rounded bg-gray-700"
            >
              <div
                className="h-full bg-cyan-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-sm text-gray-400">
              {progress < 100
                ? `Uploading... ${progress}%`
                : "Processing video, please wait..."}
            </p>
          </div>
        )}

        {serverError && (
          <p role="alert" className="text-sm text-red-500">
            {serverError}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isUploading}
            className="rounded bg-cyan-700 px-4 py-2 font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
          {isUploading && (
            <button
              type="button"
              onClick={() => abortRef.current?.()}
              className="rounded border border-gray-600 px-4 py-2 text-gray-300 hover:border-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
