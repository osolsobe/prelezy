"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: { id: string; displayName: string };
}

interface CommentsSectionProps {
  routeId: string;
  comments: Comment[];
  locale: string;
}

export default function CommentsSection({
  routeId,
  comments: initialComments,
  locale,
}: CommentsSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const cs = locale === "cs";

  const userId = session?.user?.id;
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId, text }),
    });

    if (res.ok) {
      const comment = await res.json();
      setComments([comment, ...comments]);
      setText("");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete(commentId: string) {
    if (!confirm(cs ? "Smazat komentář?" : "Delete comment?")) return;

    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setComments(comments.filter((c) => c.id !== commentId));
    }
  }

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">
        {cs ? "Komentáře" : "Comments"} ({comments.length})
      </h3>

      {session ? (
        <form onSubmit={handleSubmit} className="mb-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            placeholder={
              cs
                ? "Napište komentář... (max 500 znaků)"
                : "Write a comment... (max 500 chars)"
            }
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">{text.length}/500</span>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {cs ? "Přidat komentář" : "Add comment"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          {cs ? "Pro přidání komentáře se " : ""}
          <a href={`/${locale}/login`} className="text-blue-600 hover:underline">
            {cs ? "přihlaste" : "Log in to comment"}
          </a>
          {cs ? "." : "."}
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-gray-400 text-sm">
          {cs ? "Zatím žádné komentáře" : "No comments yet"}
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {c.user.displayName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString(
                      locale === "cs" ? "cs-CZ" : "en-US"
                    )}
                  </span>
                  {(userId === c.user.id || isAdmin) && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
