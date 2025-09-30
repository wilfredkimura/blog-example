import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
  if (dbUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    take: 200,
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
  if (dbUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { email, name, role: newRole, password } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (newRole !== "USER" && newRole !== "ADMIN") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    let passwordHash: string | undefined = undefined;
    if (password) {
      if (typeof password !== "string" || password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
      passwordHash = await hash(password, 10);
    }
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: { name: name || undefined, role: newRole, ...(passwordHash ? { passwordHash } : {}) },
      create: { email: email.toLowerCase(), name: name || null, role: newRole, ...(passwordHash ? { passwordHash } : {}) },
    });
    return NextResponse.json({ id: user.id, success: true });
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
    const { userId, role: newRole } = await req.json();
    if (!userId || (newRole !== "USER" && newRole !== "ADMIN")) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await prisma.user.update({ where: { id: String(userId) }, data: { role: newRole } });
    return NextResponse.json({ success: true });
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
    // Clean up related data (sessions/accounts) before deleting user
    await prisma.session.deleteMany({ where: { userId: id } });
    await prisma.account.deleteMany({ where: { userId: id } });
    await prisma.comment.deleteMany({ where: { authorId: id } }).catch(() => {});
    await prisma.post.updateMany({ where: { authorId: id }, data: { authorId: null } });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
