import Hero from "@/components/Hero";
import SubscriptionForm from "@/components/SubscriptionForm";
import PostCard, { PostCardProps } from "@/components/PostCard";
import prisma from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";

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

  return (
    <div>
      <Hero />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <section>
          <h2 className="text-xl font-semibold mb-4">Latest Posts</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <div key={p.href}>
                <PostCard {...p} />
                <div className="mt-2">
                  <LikeButton postId={p.id} initialLikes={p.likes} />
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
