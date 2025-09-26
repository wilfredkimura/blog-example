"use client";
import { useEffect, useState } from "react";

interface Stats {
  posts: number;
  users: number;
  comments: number;
  subscriptions: number;
  latestPosts: Array<{ id: string; title: string; date: string }>;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setStats(data as Stats);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      {loading ? <p>Loading…</p> : err ? <p className="text-red-600 text-sm">{err}</p> : stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg section-secondary"><div className="text-2xl font-bold">{stats.posts}</div><div className="text-sm">Posts</div></div>
          <div className="p-4 rounded-lg section-secondary"><div className="text-2xl font-bold">{stats.users}</div><div className="text-sm">Users</div></div>
          <div className="p-4 rounded-lg section-secondary"><div className="text-2xl font-bold">{stats.comments}</div><div className="text-sm">Comments</div></div>
          <div className="p-4 rounded-lg section-secondary"><div className="text-2xl font-bold">{stats.subscriptions}</div><div className="text-sm">Subscriptions</div></div>
        </div>
      )}
      {stats && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Latest Posts</h2>
          <ul className="list-disc pl-6 text-sm">
            {stats.latestPosts.map(p => (
              <li key={p.id}><a className="underline" href={`/posts/${p.id}`} target="_blank" rel="noopener">{p.title}</a> — {new Date(p.date).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
