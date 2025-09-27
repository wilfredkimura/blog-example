import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { marked } from "marked";
import Comments from "@/components/Comments";
import LikeButton from "@/components/LikeButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Params { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { id: slug } });
  if (!post) return { title: "Post not found" };
  const title = post.title;
  const description = (post.content || "").slice(0, 160);
  return { title, description };
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { id: slug },
    include: {
      author: { select: { name: true } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });
  if (!post) return notFound();
  // Determine if current user has liked this post
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  let initialLiked = false;
  if (userId) {
    const like = await prisma.like.findUnique({ where: { postId_userId: { postId: post.id, userId } }, select: { id: true } });
    initialLiked = !!like;
  }
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const shareUrl = `${base}/posts/${slug}`;
  const html = typeof post.content === "string" && post.content.trim().length
    ? marked.parse(post.content)
    : "";
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Hero header */}
      <section className="overflow-hidden rounded-2xl border relative">
        {post.imageUrl && (
          <div className="relative aspect-[21/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/30 to-transparent" />
          </div>
        )}
        <div className="p-6 md:p-8">
          <time className="text-[11px] uppercase tracking-wide text-foreground/60">{new Date(post.date).toLocaleDateString()}</time>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">{post.title}</h1>
          <p className="mt-1 text-sm text-foreground/70">{post.author?.name ? post.author.name : ""}</p>
          <div className="mt-3">
            <LikeButton postId={post.id} initialLikes={(post as any).likes ?? 0} initialLiked={initialLiked} />
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {post.categories.map((c) => (
              <span key={c.categoryId} className="text-xs px-2 py-1 rounded-full border">{c.category.name}</span>
            ))}
            {post.tags.map((t) => (
              <span key={t.tagId} className="text-xs px-2 py-1 rounded-full border">#{t.tag.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="mt-8 card p-5 md:p-6 prose prose-slate dark:prose-invert" dangerouslySetInnerHTML={{ __html: html as string }} />

      {/* Share */}
      <div className="mt-6 card p-4 flex items-center gap-3">
        <a
          className="inline-flex items-center justify-center w-9 h-9 border rounded hover:bg-foreground/5"
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
          target="_blank"
          rel="noopener"
          aria-label="Share on X"
          title="Share on X"
        >
          {/* X / Twitter icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2H21l-6.51 7.44L22 22h-6.656l-4.36-5.64L5.77 22H3l7.02-8.03L2 2h6.77l3.94 5.18L18.244 2Zm-1.164 18h1.824L8.99 4h-1.86l9.95 16Z"/>
          </svg>
        </a>
        <a
          className="inline-flex items-center justify-center w-9 h-9 border rounded hover:bg-foreground/5"
          href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + shareUrl)}`}
          target="_blank"
          rel="noopener"
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
        >
          {/* WhatsApp icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.14 6.44 2.14 11.9c0 2.09.62 4.03 1.68 5.65L2 22l4.6-1.77c1.56.86 3.36 1.35 5.27 1.35 5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm0 17.82c-1.7 0-3.28-.5-4.6-1.36l-.33-.21-2.73 1.05 1.02-2.8-.22-.34A7.87 7.87 0 0 1 4.22 11.9c0-4.32 3.5-7.82 7.82-7.82 4.31 0 7.81 3.5 7.81 7.82 0 4.31-3.5 7.82-7.81 7.82Zm4.56-5.38c-.25-.13-1.47-.72-1.7-.8-.23-.09-.4-.13-.57.13-.17.25-.65.8-.8.97-.15.17-.3.2-.55.07-.25-.13-1.05-.39-2-1.25-.74-.66-1.24-1.48-1.38-1.72-.14-.25-.01-.38.12-.51.13-.12.25-.3.38-.45.12-.16.17-.25.25-.42.09-.17.04-.32-.02-.45-.06-.13-.57-1.37-.78-1.87-.2-.47-.4-.4-.57-.41l-.49-.01c-.17 0-.45.06-.69.33-.24.26-.9.88-.9 2.16 0 1.28.92 2.52 1.05 2.7.13.17 1.81 2.76 4.39 3.87.61.26 1.09.42 1.46.53.61.19 1.16.16 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.06.15-1.18-.06-.12-.22-.19-.47-.32Z"/>
          </svg>
        </a>
        <a
          className="inline-flex items-center justify-center w-9 h-9 border rounded hover:bg-foreground/5"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener"
          aria-label="Share on Facebook"
          title="Share on Facebook"
        >
          {/* Facebook icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M22 12.06C22 6.53 17.52 2.05 12 2.05S2 6.53 2 12.06c0 4.99 3.66 9.13 8.44 9.95v-7.03H7.9v-2.92h2.54V9.83c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.92h-2.34V22c4.78-.82 8.44-4.96 8.44-9.95Z"/>
          </svg>
        </a>
      </div>
      {/* Comments */}
      <Comments postId={post.id} />
    </main>
  );
}
