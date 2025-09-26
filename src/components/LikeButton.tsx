"use client";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

export default function LikeButton({ postId, initialLikes = 0 }: { postId: string; initialLikes?: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [pending, startTransition] = useTransition();

  const onLike = () => {
    if (pending) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
        if (res.status === 401) {
          // Not signed in – redirect to sign in and come back
          await signIn(undefined, { callbackUrl: typeof window !== "undefined" ? window.location.href : "/" });
          return;
        }
        if (!res.ok) throw new Error("Failed to like");
        const data = await res.json();
        setLikes(data.likes);
      } catch (e) {
        // no-op; could show toast
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onLike}
      aria-label="Like this post"
      className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded border hover:bg-foreground/5 disabled:opacity-50"
      disabled={pending}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.1 21.35l-1.1-1.01C5.14 14.24 2 11.39 2 8.08 2 5.64 3.99 3.75 6.3 3.75c1.39 0 2.74.65 3.6 1.69.86-1.04 2.21-1.69 3.6-1.69 2.31 0 4.4 1.89 4.4 4.33 0 3.31-3.14 6.16-8.9 12.26l-1.9 2.01z" />
      </svg>
      <span>{likes}</span>
    </button>
  );
}
