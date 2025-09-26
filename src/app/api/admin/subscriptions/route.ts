import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rows = await prisma.subscription.findMany({ orderBy: { date: "desc" }, select: { id: true, email: true, date: true } });
  const subscriptions = rows.map((r: { id: string; email: string; date: Date }) => ({ id: r.id, email: r.email, createdAt: r.date }));
  return NextResponse.json({ subscriptions });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.subscription.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
