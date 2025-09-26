import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
