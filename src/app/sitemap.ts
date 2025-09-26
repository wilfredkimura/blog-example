import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
    { url: `${base}/archives`, lastModified: new Date() },
    { url: `${base}/search`, lastModified: new Date() },
  ];

  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { id: true, date: true },
    orderBy: { date: "desc" },
    take: 200,
  });

  const postRoutes: MetadataRoute.Sitemap = posts.map((p: { id: string; date: Date }) => ({
    url: `${base}/posts/${p.id}`,
    lastModified: p.date,
  }));

  return [...staticRoutes, ...postRoutes];
}
