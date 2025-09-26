"use client";
import { useEffect, useState } from "react";

export type FiltersModalProps = {
  actionPath: string; // e.g. "/archives" or current category path
  params: { sort?: string; from?: string; to?: string; q?: string; page?: string; categoryId?: string; tagId?: string };
  // Which controls to show
  showSearch?: boolean;
  showDateRange?: boolean;
  sortOptions?: Array<{ value: string; label: string }>;
  // Optional taxonomy filters (single-select)
  categories?: Array<{ id: string; name: string }>;
  tags?: Array<{ id: string; name: string }>;
};

export default function FiltersModal({ actionPath, params, showSearch = true, showDateRange = true, sortOptions = [
  { value: "date_desc", label: "Newest" },
  { value: "date_asc", label: "Oldest" },
  { value: "comments_desc", label: "Most commented" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "title_desc", label: "Title Z–A" },
], categories, tags }: FiltersModalProps) {
  const [open, setOpen] = useState(false);
  const sortKey = (params.sort || "date_desc").toLowerCase();

  // Prevent background scroll when modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const clearHref = actionPath; // clears all params

  return (
    <div>
      <button type="button" className="px-3 py-1 border rounded" onClick={() => setOpen(true)}>Filters</button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg bg-white text-black rounded-lg shadow-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button className="text-sm underline" onClick={() => setOpen(false)}>Close</button>
            </div>
            <form method="get" action={actionPath} className="space-y-3">
              {/* reset to page 1 on apply */}
              <input type="hidden" name="page" value="1" />

              {showSearch && (
                <div>
                  <label className="block text-xs mb-1">Search</label>
                  <input name="q" type="text" defaultValue={params.q || ""} placeholder="Search title or content" className="w-full px-2 py-2 border rounded" />
                </div>
              )}

              {showDateRange && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1">From</label>
                    <input name="from" type="date" defaultValue={params.from || ""} className="w-full px-2 py-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">To</label>
                    <input name="to" type="date" defaultValue={params.to || ""} className="w-full px-2 py-2 border rounded" />
                  </div>
                </div>
              )}

              {categories && categories.length > 0 && (
                <div>
                  <label className="block text-xs mb-1">Category</label>
                  <select name="categoryId" defaultValue={params.categoryId || ""} className="w-full px-2 py-2 border rounded">
                    <option value="">All</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {tags && tags.length > 0 && (
                <div>
                  <label className="block text-xs mb-1">Tag</label>
                  <select name="tagId" defaultValue={params.tagId || ""} className="w-full px-2 py-2 border rounded">
                    <option value="">All</option>
                    {tags.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs mb-1">Sort</label>
                <select name="sort" defaultValue={sortKey} className="w-full px-2 py-2 border rounded">
                  {sortOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a href={clearHref} className="px-3 py-2 border rounded">Clear</a>
                <button className="btn-accent px-4 py-2 rounded-md font-semibold" type="submit" onClick={() => setOpen(false)}>Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
