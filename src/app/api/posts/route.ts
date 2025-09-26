import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const take = Number(searchParams.get("take") || 10);
  const skip = Number(searchParams.get("skip") || 0);

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
    take,
    skip,
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      author: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const post = await prisma.post.create({ data: body });
    return NextResponse.json(post);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
