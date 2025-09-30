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
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return NextResponse.json({ tags });
}

export async function POST(req: Request) {
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
  const { name } = await req.json();
  if (!name || typeof name !== "string") return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  const t = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
  return NextResponse.json({ id: t.id });
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
  await prisma.postTag.deleteMany({ where: { tagId: id } });
  await prisma.tag.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
