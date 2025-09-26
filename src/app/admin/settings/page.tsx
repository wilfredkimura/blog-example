"use client";
import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([]);
  const [catName, setCatName] = useState("");
  const [tagName, setTagName] = useState("");

  async function load() {
    const [c, t] = await Promise.all([
      fetch("/api/admin/categories").then(r => r.json()),
      fetch("/api/admin/tags").then(r => r.json()),
    ]);
    setCategories(c.categories || []);
    setTags(t.tags || []);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Categories</h2>
        <div className="flex gap-2">
          <input className="px-3 py-2 border rounded-md" placeholder="New category name" value={catName} onChange={(e) => setCatName(e.target.value)} />
          <button className="btn-accent px-4 py-2 rounded-md font-semibold" onClick={async () => {
            if (!catName.trim()) return;
            const res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: catName.trim() }) });
            const data = await res.json();
            if (!res.ok) return alert(data.error || "Failed to add category");
            setCatName("");
            await load();
          }}>Add</button>
        </div>
        <ul className="space-y-1 text-sm">
          {categories.map(c => (
            <li key={c.id} className="flex justify-between items-center border rounded-md px-3 py-2">
              <span>{c.name}</span>
              <button className="underline text-red-600" onClick={async () => {
                const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(c.id)}`, { method: "DELETE" });
                const data = await res.json();
                if (!res.ok) return alert(data.error || "Failed to delete");
                await load();
              }}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Tags</h2>
        <div className="flex gap-2">
          <input className="px-3 py-2 border rounded-md" placeholder="New tag name" value={tagName} onChange={(e) => setTagName(e.target.value)} />
          <button className="btn-accent px-4 py-2 rounded-md font-semibold" onClick={async () => {
            if (!tagName.trim()) return;
            const res = await fetch("/api/admin/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: tagName.trim() }) });
            const data = await res.json();
            if (!res.ok) return alert(data.error || "Failed to add tag");
            setTagName("");
            await load();
          }}>Add</button>
        </div>
        <ul className="space-y-1 text-sm">
          {tags.map(t => (
            <li key={t.id} className="flex justify-between items-center border rounded-md px-3 py-2">
              <span>{t.name}</span>
              <button className="underline text-red-600" onClick={async () => {
                const res = await fetch(`/api/admin/tags?id=${encodeURIComponent(t.id)}`, { method: "DELETE" });
                const data = await res.json();
                if (!res.ok) return alert(data.error || "Failed to delete");
                await load();
              }}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
