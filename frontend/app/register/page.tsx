"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/FormInput";
import { register, ApiClientError } from "@/lib/api";
import { validateRegister, type RegisterErrors } from "@/lib/validators";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    const result = validateRegister({
      fullName,
      userName,
      email,
      password,
      avatar,
      coverImage,
    });
    setErrors(result);
    if (Object.keys(result).length > 0 || !avatar) {
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName.trim());
    formData.append("userName", userName.trim().toLowerCase());
    formData.append("email", email.trim().toLowerCase());
    formData.append("password", password);
    formData.append("avatar", avatar);
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    setIsLoading(true);
    try {
      await register(formData);
      setFullName("");
      setUserName("");
      setEmail("");
      setPassword("");
      setAvatar(null);
      setCoverImage(null);
      setErrors({});
      setFormKey((k) => k + 1);
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiClientError) {
        setServerError(error.message);
      } else {
        setServerError("Something went wrong. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const fileClasses =
    "text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-700 file:px-3 file:py-1 file:text-white hover:file:bg-cyan-600";

  return (
    <main className="flex items-center justify-center px-4 py-10">
      <form
        key={formKey}
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="text-3xl font-bold">Create account</h1>

        <FormInput
          id="fullName"
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />

        <FormInput
          id="userName"
          label="Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          error={errors.userName}
        />

        <FormInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="avatar" className="text-sm text-gray-300">
            Profile picture (required)
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
            className={fileClasses}
          />
          {errors.avatar && (
            <p className="text-sm text-red-500">{errors.avatar}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="coverImage" className="text-sm text-gray-300">
            Cover image (optional)
          </label>
          <input
            id="coverImage"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
            className={fileClasses}
          />
          {errors.coverImage && (
            <p className="text-sm text-red-500">{errors.coverImage}</p>
          )}
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-red-500">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-cyan-700 px-4 py-2 font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </main>
  );
}
