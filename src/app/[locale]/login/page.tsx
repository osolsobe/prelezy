"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;

  const callbackUrl = searchParams.get("callbackUrl") ?? `/${locale}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(locale === "cs" ? "Nesprávný e-mail nebo heslo" : "Invalid email or password");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {locale === "cs" ? "Přihlášení" : "Login"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale === "cs" ? "Heslo" : "Password"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? locale === "cs" ? "Přihlašuji..." : "Logging in..."
            : locale === "cs" ? "Přihlásit se" : "Log in"}
        </button>

        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>
            {locale === "cs" ? "Nemáte účet?" : "Don't have an account?"}{" "}
            <Link href={`/${locale}/register`} className="text-blue-600 hover:underline">
              {locale === "cs" ? "Zaregistrovat se" : "Register"}
            </Link>
          </p>
          <p>
            <Link href={`/${locale}/forgot-password`} className="text-gray-400 hover:text-gray-600 text-xs">
              {locale === "cs" ? "Zapomněli jste heslo?" : "Forgot your password?"}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
