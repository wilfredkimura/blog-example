import Hero from "@/components/Hero";
import FollowBar from "../components/FollowBar";
import SubscriptionForm from "@/components/SubscriptionForm";
import PostCard, { PostCardProps } from "@/components/PostCard";
import prisma from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch newest posts directly from the database
  const posts: Array<{ id: string; title: string; date: Date; imageUrl: string | null; content: string; likes: number }> = await prisma.post.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
    take: 9,
    select: { id: true, title: true, date: true, imageUrl: true, content: true, likes: true },
  });
  const featured: (PostCardProps & { id: string; likes: number })[] = posts.map((p: { id: string; title: string; date: Date; imageUrl: string | null; content: string; likes: number }) => ({
    title: p.title,
    href: `/posts/${p.id}`,
    date: p.date.toISOString(),
    imageUrl: p.imageUrl ?? undefined,
    excerpt: (p.content || "").slice(0, 160),
    id: p.id,
    likes: p.likes ?? 0,
  }));

  // Pick a featured post: most liked among the fetched set (fallback to newest)
  const top = featured.length
    ? featured.slice().sort((a, b) => b.likes - a.likes || (new Date(b.date).getTime() - new Date(a.date).getTime()))[0]
    : null;
  const rest = top ? featured.filter((p) => p.id !== top.id) : featured;

  // Determine which of these posts the current user has liked
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  let likedSet = new Set<string>();
  if (userId && posts.length) {
    const likes = await prisma.like.findMany({
      where: { userId, postId: { in: posts.map((p) => p.id) } },
      select: { postId: true },
    });
    likedSet = new Set(likes.map((l) => l.postId));
  }

  return (
    <div>
      <Hero />
      <FollowBar />
      <main className="mx-auto max-w-6xl px-4 py-12">
        {top && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Featured</h2>
            <a href={top.href} className="block group card card-hover overflow-hidden relative">
              {top.imageUrl && (
                <div className="relative aspect-[21/9]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={top.imageUrl} alt={top.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                </div>
              )}
              <div className="p-6 md:p-8">
                <time className="text-[11px] uppercase tracking-wide text-foreground/60">{new Date(top.date).toLocaleDateString()}</time>
                <h3 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">{top.title}</h3>
                {top.excerpt && <p className="mt-3 text-sm md:text-base text-foreground/80 line-clamp-3">{top.excerpt}</p>}
                <div className="mt-3">
                  <LikeButton postId={top.id} initialLikes={top.likes} initialLiked={likedSet.has(top.id)} />
                </div>
              </div>
            </a>
          </section>
        )}
        <section>
          <h2 className="text-xl font-semibold mb-4">Latest Posts</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <div key={p.href}>
                <PostCard {...p} />
                <div className="mt-2">
                  <LikeButton postId={p.id} initialLikes={p.likes} initialLiked={likedSet.has(p.id)} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section id="subscribe" className="mt-16">
          <SubscriptionForm />
        </section>
      </main>
    </div>
  );
}
