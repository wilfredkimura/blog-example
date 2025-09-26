import prisma from "@/lib/prisma";
import FiltersModal from "@/components/FiltersModal";

export const metadata = {
  title: "Search • Unveiling Truth",
  description: "Find posts by keywords.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; from?: string; to?: string; sort?: string; page?: string }> }) {
  const { q = "", from, to, sort, page } = await searchParams;
  const sortKey = (sort || "date_desc").toLowerCase();
  const orderBy =
    sortKey === "date_asc"
      ? { date: "asc" as const }
      : sortKey === "comments_desc"
      ? ({ comments: { _count: "desc" as const } } as const)
      : { date: "desc" as const };

  const dateWhere: any = {};
  if (from) {
    const d = new Date(from);
    if (!isNaN(d.valueOf())) dateWhere.gte = d;
  }
  if (to) {
    const d = new Date(to);
    if (!isNaN(d.valueOf())) dateWhere.lte = d;
  }

  const whereBase: any = {
    published: true,
    ...(Object.keys(dateWhere).length ? { date: dateWhere } : {}),
    ...(q.trim().length ? { OR: [{ title: { contains: q } }, { content: { contains: q } }] } : {}),
  };

  const take = 20;
  const pageNum = Math.max(1, parseInt((page as string) || "1", 10) || 1);
  const skip = (pageNum - 1) * take;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: whereBase,
      orderBy,
      take,
      skip,
      select: { id: true, title: true, date: true, _count: { select: { comments: true } } },
    }),
    prisma.post.count({ where: whereBase }),
  ]);

  const makeHref = (newPage: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    if (sortKey) sp.set("sort", sortKey);
    sp.set("page", String(newPage));
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  };
  const hasPrev = pageNum > 1;
  const hasNext = skip + take < total;
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Search</h1>
      {/* Quick search bar (keeps existing filters) */}
      <form className="mt-4 flex gap-2" method="get" action="/search">
        <input type="hidden" name="from" value={from || ""} />
        <input type="hidden" name="to" value={to || ""} />
        <input type="hidden" name="sort" value={sortKey} />
        <input type="hidden" name="page" value="1" />
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Search posts..."
          className="w-full px-3 py-2 border rounded-md"
        />
        <button className="px-4 py-2 border rounded-md">Search</button>
      </form>
      <div className="mt-4">
        <FiltersModal
          actionPath="/search"
          params={{ q, from: from || undefined, to: to || undefined, sort: sortKey, page: String(page || 1) }}
          showSearch
          showDateRange
          sortOptions={[
            { value: "date_desc", label: "Newest" },
            { value: "date_asc", label: "Oldest" },
            { value: "comments_desc", label: "Most commented" },
          ]}
        />
      </div>
      <ul className="mt-6 space-y-2">
        {posts.map((p: { id: string; title: string; date: Date; _count: { comments: number } }) => (
          <li key={p.id}>
            <a className="underline" href={`/posts/${p.id}`}>
              {new Date(p.date).toLocaleDateString()} — {p.title}
            </a>
            <span className="ml-2 text-sm opacity-70">({p._count.comments} comments)</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between text-sm">
        <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={!hasPrev}>
          {hasPrev ? <a href={makeHref(pageNum - 1)}>Previous</a> : <span>Previous</span>}
        </button>
        <span>Page {pageNum}{total ? ` of ${Math.max(1, Math.ceil(total / take))}` : ""}</span>
        <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={!hasNext}>
          {hasNext ? <a href={makeHref(pageNum + 1)}>Next</a> : <span>Next</span>}
        </button>
      </div>
    </main>
  );
}
