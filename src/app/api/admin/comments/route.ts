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
  const rows = await prisma.comment.findMany({
    orderBy: { date: "desc" },
    select: { id: true, postId: true, author: true, content: true, date: true },
    take: 500,
  });
  const comments = rows.map((r: { id: string; postId: string; author: string | null; content: string; date: Date }) => ({
    id: r.id,
    postId: r.postId,
    author: r.author,
    content: r.content,
    createdAt: r.date,
  }));
  return NextResponse.json({ comments });
}

export async function DELETE(req: Request) {
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
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
