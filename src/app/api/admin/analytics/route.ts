import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [posts, users, comments, subscriptions, latest] = await Promise.all([
    prisma.post.count(),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.subscription.count(),
    prisma.post.findMany({ orderBy: { date: "desc" }, take: 10, select: { id: true, title: true, date: true } }),
  ]);
  return NextResponse.json({ posts, users, comments, subscriptions, latestPosts: latest });
}
