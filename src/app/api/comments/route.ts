import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    const comments = await prisma.comment.findMany({
      where: { postId: String(postId) },
      orderBy: { date: "asc" },
      select: { id: true, author: true, content: true, date: true },
    });
    return NextResponse.json({ comments });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { postId, author, content } = await req.json();
    if (!postId || !content || typeof content !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const comment = await prisma.comment.create({
      data: {
        postId,
        author: author?.slice(0, 100) || "Anonymous",
        content: content.slice(0, 5000),
        approved: true,
      },
    });
    return NextResponse.json({ success: true, id: comment.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
