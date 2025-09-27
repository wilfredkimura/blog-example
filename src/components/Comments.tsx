"use client";
import { useEffect, useState } from "react";

type CommentItem = {
  id: string;
  author: string | null;
  content: string;
  date: string;
};

export default function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load comments");
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, author: author.trim() || undefined, content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");
      setAuthor("");
      setContent("");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">Comments</h2>
      <div className="mt-4 card p-4 md:p-5">
        {loading ? (
          <p className="text-sm opacity-75">Loading…</p>
        ) : comments.length === 0 ? (
          <p className="text-sm opacity-75">Be the first to comment.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="border rounded-md p-3">
                <div className="text-sm opacity-75 mb-1">
                  <span className="font-medium">{c.author || "Anonymous"}</span> · {new Date(c.date).toLocaleString()}
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{c.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 card p-4 md:p-5">
        <form onSubmit={onSubmit} className="space-y-2">
          <input
            type="text"
            placeholder="Your name (optional)"
            className="w-full px-3 py-2 border rounded-md"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <textarea
            placeholder="Write your comment…"
            className="w-full px-3 py-2 border rounded-md min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={submitting} className="btn-accent px-4 py-2 rounded-md font-semibold">
            {submitting ? "Posting…" : "Post Comment"}
          </button>
        </form>
      </div>
    </section>
  );
}
