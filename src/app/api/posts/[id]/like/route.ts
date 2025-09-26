import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If already liked, return current count without increment
    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: id, userId } },
      select: { id: true },
    });
    if (existing) {
      const current = await prisma.post.findUnique({ where: { id }, select: { likes: true } });
      return NextResponse.json({ likes: current?.likes ?? 0, liked: true });
    }

    // Create like and increment in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.like.create({ data: { postId: id, userId } });
      const updated = await tx.post.update({ where: { id }, data: { likes: { increment: 1 } }, select: { likes: true } });
      return updated.likes;
    });
    return NextResponse.json({ likes: result, liked: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Unable to like post" }, { status: 400 });
  }
}
