import Link from "next/link";

export default function Pagination({ page, totalPages, makeHref }: { page: number; totalPages: number; makeHref: (p: number) => string }) {
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  return (
    <div className="mt-6 flex items-center justify-between text-sm">
      <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={!hasPrev}>
        {hasPrev ? <Link href={makeHref(page - 1)}>Previous</Link> : <span>Previous</span>}
      </button>
      <span>
        Page {page}
        {totalPages ? ` of ${totalPages}` : ""}
      </span>
      <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={!hasNext}>
        {hasNext ? <Link href={makeHref(page + 1)}>Next</Link> : <span>Next</span>}
      </button>
    </div>
  );
}
