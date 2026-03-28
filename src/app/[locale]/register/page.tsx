"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(
        data.error === "emailExists"
          ? locale === "cs" ? "E-mail je již registrován" : "Email is already registered"
          : locale === "cs" ? "Chyba při registraci" : "Registration error"
      );
      setLoading(false);
      return;
    }

    // Automaticky přihlásíme
    await signIn("credentials", { email, password, redirect: false });
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {locale === "cs" ? "Registrace" : "Register"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale === "cs" ? "Přezdívka" : "Display name"}
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            minLength={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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
            {locale === "cs" ? "Heslo (min. 8 znaků)" : "Password (min. 8 chars)"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? locale === "cs" ? "Registruji..." : "Registering..."
            : locale === "cs" ? "Zaregistrovat se" : "Register"}
        </button>

        <p className="text-center text-sm text-gray-500">
          {locale === "cs" ? "Máte účet?" : "Already have an account?"}{" "}
          <Link href={`/${locale}/login`} className="text-blue-600 hover:underline">
            {locale === "cs" ? "Přihlásit se" : "Log in"}
          </Link>
        </p>
      </form>
    </div>
  );
}
