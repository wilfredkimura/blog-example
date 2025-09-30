import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure a corresponding User exists in our database for FK relations
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    // Toggle like: if exists -> unlike, else -> like
    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: id, userId } },
      select: { id: true },
    });
    if (existing) {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.like.delete({ where: { postId_userId: { postId: id, userId } } });
        const updated = await tx.post.update({ where: { id }, data: { likes: { decrement: 1 } }, select: { likes: true } });
        // Defensive clamp to 0
        return Math.max(0, updated.likes);
      });
      return NextResponse.json({ likes: result, liked: false });
    } else {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.like.create({ data: { postId: id, userId } });
        const updated = await tx.post.update({ where: { id }, data: { likes: { increment: 1 } }, select: { likes: true } });
        return updated.likes;
      });
      return NextResponse.json({ likes: result, liked: true });
    }
  } catch (e: any) {
    return NextResponse.json({ error: "Unable to like post" }, { status: 400 });
  }
}
