"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string;
  const cs = locale === "cs";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, lang: locale }),
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="max-w-sm mx-auto mt-12 text-center">
        <div className="text-4xl mb-4">📧</div>
        <h1 className="text-xl font-bold mb-2">
          {cs ? "E-mail odeslán" : "Email sent"}
        </h1>
        <p className="text-gray-500 text-sm">
          {cs
            ? "Pokud je e-mail registrován, pošleme vám odkaz pro obnovení hesla."
            : "If the email is registered, we'll send you a password reset link."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {cs ? "Obnovení hesla" : "Reset Password"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "..." : cs ? "Odeslat odkaz" : "Send link"}
        </button>
      </form>
    </div>
  );
}
