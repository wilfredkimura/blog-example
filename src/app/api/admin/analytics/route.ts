import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ensureDbUser } from "@/lib/ensureDbUser";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cu = await currentUser();
  const dbUser = await ensureDbUser(userId, {
    email: cu?.emailAddresses?.[0]?.emailAddress ?? null,
    firstName: cu?.firstName ?? null,
    lastName: cu?.lastName ?? null,
    username: (cu as any)?.username ?? null,
  });
  if (dbUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [posts, users, comments, subscriptions, latest] = await Promise.all([
    prisma.post.count(),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.subscription.count(),
    prisma.post.findMany({ orderBy: { date: "desc" }, take: 10, select: { id: true, title: true, date: true } }),
  ]);
  return NextResponse.json({ posts, users, comments, subscriptions, latestPosts: latest });
}
