import prisma from "@/lib/prisma";
import Link from "next/link";
import FiltersModal from "@/components/FiltersModal";
import LikeButton from "@/components/LikeButton";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Params { slug: string }

export const metadata = {
  title: "Category • Unveiling Truth",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CategoryPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<{ sort?: string; from?: string; to?: string; q?: string; page?: string }> }) {
  const { slug } = await params;
  const { sort, from, to, q, page } = await searchParams;
  const sortKey = (sort || "date_desc").toLowerCase();
  const orderBy =
    sortKey === "date_asc"
      ? { date: "asc" as const }
      : sortKey === "title_asc"
      ? ({ title: "asc" as const })
      : sortKey === "title_desc"
      ? ({ title: "desc" as const })
      : sortKey === "comments_desc"
      ? ({ comments: { _count: "desc" as const } } as const)
      : { date: "desc" as const };
  // Normalize by comparing against a slugified version of Category.name
  const categories: Array<{ id: string; name: string }> = await prisma.category.findMany({ select: { id: true, name: true } });
  const slugify = (s: string): string => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
  const match = categories.find((c: { id: string; name: string }) => slugify(c.name) === slug);
  const category = match ? { id: match.id, name: match.name } : null;
  const dateWhere: any = {};
  if (from) {
    const d = new Date(from);
    if (!isNaN(d.valueOf())) dateWhere.gte = d;
  }
  if (to) {
    const d = new Date(to);
    if (!isNaN(d.valueOf())) dateWhere.lte = d;
  }
  const whereBase: any = category
    ? {
        published: true,
        ...(Object.keys(dateWhere).length ? { date: dateWhere } : {}),
        categories: { some: { categoryId: category.id } },
        ...(q && q.trim().length
          ? { OR: [{ title: { contains: q } }, { content: { contains: q } }] }
          : {}),
      }
    : null;

  const take = 20;
  const pageNum = Math.max(1, parseInt((page as string) || "1", 10) || 1);
  const skip = (pageNum - 1) * take;

  const [posts, total] = whereBase
    ? await Promise.all([
        prisma.post.findMany({
          where: whereBase,
          orderBy,
          take,
          skip,
          select: {
            id: true,
            title: true,
            date: true,
            imageUrl: true,
            content: true,
            likes: true,
            _count: { select: { comments: true } },
            categories: { select: { category: { select: { name: true } } } },
            tags: { select: { tag: { select: { name: true } } } },
          },
        }),
        prisma.post.count({ where: whereBase }),
      ])
    : [[], 0];

  // Determine which of these posts the current user has liked
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  let likedSet = new Set<string>();
  if (userId && (posts as any[]).length) {
    const likes = await prisma.like.findMany({
      where: { userId, postId: { in: (posts as any[]).map((p) => p.id) } },
      select: { postId: true },
    });
    likedSet = new Set(likes.map((l) => l.postId));
  }

  const makeHref = (newPage: number) => {
    const sp = new URLSearchParams();
    if (sortKey) sp.set("sort", sortKey);
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    if (q) sp.set("q", q);
    sp.set("page", String(newPage));
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  };
  const hasPrev = pageNum > 1;
  const hasNext = skip + take < total;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">{category ? category.name : slug}</h1>
      <div className="mt-4">
        <FiltersModal
          actionPath={`/category/${slug}`}
          params={{ sort: sortKey, from: from || undefined, to: to || undefined, q: q || undefined, page: String(page || 1) }}
          showSearch
          showDateRange
          sortOptions={[
            { value: "date_desc", label: "Newest" },
            { value: "date_asc", label: "Oldest" },
            { value: "comments_desc", label: "Most commented" },
            { value: "title_asc", label: "Title A–Z" },
            { value: "title_desc", label: "Title Z–A" },
          ]}
        />
      </div>
      <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p: { id: string; title: string; date: Date; imageUrl: string | null; content: string; likes: number; _count: { comments: number }; categories: { category: { name: string } }[]; tags: { tag: { name: string } }[] }) => {
          const excerpt = (p.content || "").slice(0, 160);
          const catNames = (p.categories || []).map((c) => c.category.name);
          const tagNames = (p.tags || []).map((t) => t.tag.name);
          return (
            <div key={p.id}>
              <PostCard
                title={p.title}
                href={`/posts/${p.id}`}
                date={p.date.toISOString()}
                imageUrl={p.imageUrl || undefined}
                excerpt={excerpt}
                categories={catNames}
                tags={tagNames}
              />
              <div className="mt-2">
                <LikeButton postId={p.id} initialLikes={p.likes ?? 0} initialLiked={likedSet.has(p.id)} />
              </div>
            </div>
          );
        })}
      </div>
      <Pagination page={pageNum} totalPages={Math.max(1, Math.ceil(total / take))} makeHref={makeHref} />
      {!category && <p className="mt-4 text-foreground/60">No such category yet.</p>}
    </main>
  );
}
