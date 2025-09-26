import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { marked } from "marked";
import Comments from "@/components/Comments";

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
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const shareUrl = `${base}/posts/${slug}`;
  const html = typeof post.content === "string" && post.content.trim().length
    ? marked.parse(post.content)
    : "";
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="mt-2 text-sm text-foreground/70">
        {new Date(post.date).toLocaleDateString()} {post.author?.name ? `• ${post.author.name}` : ""}
      </p>
      <div className="mt-4 flex gap-3 text-sm">
        <a className="underline" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener">Share on X</a>
        <a className="underline" href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + shareUrl)}`} target="_blank" rel="noopener">WhatsApp</a>
        <a className="underline" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener">Facebook</a>
      </div>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className="mt-6 w-full rounded-lg" />
      )}
      <article className="mt-6 prose prose-slate dark:prose-invert" dangerouslySetInnerHTML={{ __html: html as string }} />

      {/* Comments */}
      <Comments postId={post.id} />
    </main>
  );
}
