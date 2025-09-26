"use client";
import { useEffect, useState } from "react";

interface CommentRow {
  id: string;
  postId: string;
  author: string | null;
  content: string;
  createdAt: string;
}

export default function AdminCommentsPage() {
  const [items, setItems] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/comments");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setItems(data.comments || []);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this comment?")) return;
    const res = await fetch(`/api/admin/comments?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to delete");
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Comments</h1>
      {loading ? <p>Loading…</p> : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-[var(--secondary)] text-left">
              <tr>
                <th className="p-3">Post</th>
                <th className="p-3">Author</th>
                <th className="p-3">Content</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t align-top">
                  <td className="p-3"><a className="underline" href={`/posts/${c.postId}`} target="_blank" rel="noopener">{c.postId.slice(0,8)}</a></td>
                  <td className="p-3">{c.author || "Anonymous"}</td>
                  <td className="p-3 max-w-[480px]">
                    <div className="line-clamp-3 whitespace-pre-wrap">{c.content}</div>
                  </td>
                  <td className="p-3">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <button className="underline text-red-600" onClick={() => remove(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </div>
  );
}
