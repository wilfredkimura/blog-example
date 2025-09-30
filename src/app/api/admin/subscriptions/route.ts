import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
  if (dbUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rows = await prisma.subscription.findMany({ orderBy: { date: "desc" }, select: { id: true, email: true, date: true } });
  const subscriptions = rows.map((r: { id: string; email: string; date: Date }) => ({ id: r.id, email: r.email, createdAt: r.date }));
  return NextResponse.json({ subscriptions });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
  if (dbUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.subscription.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
