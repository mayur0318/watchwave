"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/FormInput";
import { login, ApiClientError } from "@/lib/api";
import { validateLogin, type LoginErrors } from "@/lib/validators";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    const result = validateLogin({ email, password });
    setErrors(result);
    if (Object.keys(result).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({ email: email.trim(), password });
      setUser(res.data.user);
      setEmail("");
      setPassword("");
      router.push("/");
      router.refresh();
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

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="text-3xl font-bold">Login</h1>

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
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
