"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAttemptButton({
  attemptId,
  locale,
}: {
  attemptId: string;
  locale: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const cs = locale === "cs";

  async function handleDelete() {
    if (!confirm(cs ? "Smazat tento pokus?" : "Delete this attempt?")) return;
    setLoading(true);
    await fetch(`/api/attempts/${attemptId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-400 hover:text-red-600 text-sm disabled:opacity-50 p-1"
      title={cs ? "Smazat" : "Delete"}
    >
      ✕
    </button>
  );
}
