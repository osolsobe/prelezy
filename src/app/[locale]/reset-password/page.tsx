"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params.locale as string;
  const token = searchParams.get("token") ?? "";
  const cs = locale === "cs";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push(`/${locale}/login`);
    } else {
      setError(cs ? "Token je neplatný nebo vypršel." : "Token is invalid or expired.");
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {cs ? "Nové heslo" : "New Password"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {cs ? "Nové heslo (min. 8 znaků)" : "New password (min. 8 chars)"}
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
          disabled={loading || !token}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "..." : cs ? "Nastavit heslo" : "Set password"}
        </button>
      </form>
    </div>
  );
}
