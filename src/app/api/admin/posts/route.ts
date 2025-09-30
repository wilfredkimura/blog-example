import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Ensure user exists and check role in our DB
  const dbUser = await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
  if (dbUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const take = Number(searchParams.get("take") || 50);
    try {
      const posts = await prisma.post.findMany({
        orderBy: { date: "desc" },
        take,
        include: {
          categories: { select: { categoryId: true } },
          tags: { select: { tagId: true } },
          images: { select: { id: true, url: true, position: true }, orderBy: { position: "asc" } },
        },
      });
      return NextResponse.json({ posts });
    } catch (err) {
      // Fallback for environments where PostImage relation hasn't been migrated yet
      const posts = await prisma.post.findMany({
        orderBy: { date: "desc" },
        take,
        include: {
          categories: { select: { categoryId: true } },
          tags: { select: { tagId: true } },
        },
      });
      return NextResponse.json({ posts });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
  if (dbUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { title, content, categories = [], tags = [], imageUrl = null, videoUrl = null, published = true, images = [] } = body || {};
    if (!title || !content) {
      return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: userId,
        published: !!published,
        imageUrl,
        videoUrl,
      },
      select: { id: true },
    });

    // Link categories and tags (expect arrays of IDs)
    for (const catId of categories as string[]) {
      await prisma.postCategory.create({ data: { postId: post.id, categoryId: String(catId) } });
    }
    for (const tagId of tags as string[]) {
      await prisma.postTag.create({ data: { postId: post.id, tagId: String(tagId) } });
    }

    // Create gallery images
    if (Array.isArray(images) && images.length > 0) {
      const rows = (images as string[])
        .filter((u) => typeof u === "string" && u.length)
        .map((url: string, idx: number) => ({ postId: post.id, url, position: idx }));
      if (rows.length) {
        await prisma.postImage.createMany({ data: rows });
      }
    }

    return NextResponse.json({ id: post.id, success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
  if (dbUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const { id, title, content, published, images, categories, tags, imageUrl, videoUrl } = body || {};
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const updated = await prisma.post.update({
      where: { id: String(id) },
      data: {
        ...(title != null ? { title: String(title) } : {}),
        ...(content != null ? { content: String(content) } : {}),
        ...(published != null ? { published: !!published } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl as string | null } : {}),
        ...(videoUrl !== undefined ? { videoUrl: videoUrl as string | null } : {}),
      },
      select: { id: true },
    });

    // If images provided, replace gallery
    if (Array.isArray(images)) {
      await prisma.postImage.deleteMany({ where: { postId: String(id) } });
      const rows = (images as string[])
        .filter((u) => typeof u === "string" && u.length)
        .map((url: string, idx: number) => ({ postId: String(id), url, position: idx }));
      if (rows.length) await prisma.postImage.createMany({ data: rows });
    }

    // If categories/tags provided, replace joins
    if (Array.isArray(categories)) {
      await prisma.postCategory.deleteMany({ where: { postId: String(id) } });
      for (const catId of categories as string[]) {
        await prisma.postCategory.create({ data: { postId: String(id), categoryId: String(catId) } });
      }
    }
    if (Array.isArray(tags)) {
      await prisma.postTag.deleteMany({ where: { postId: String(id) } });
      for (const tagId of tags as string[]) {
        await prisma.postTag.create({ data: { postId: String(id), tagId: String(tagId) } });
      }
    }
    return NextResponse.json({ id: updated.id, success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
  if (dbUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    // Delete join records first to satisfy FK constraints
    await prisma.postCategory.deleteMany({ where: { postId: id } });
    await prisma.postTag.deleteMany({ where: { postId: id } });
    await prisma.comment.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
