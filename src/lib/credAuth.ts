import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const COOKIE_NAME = "cred_session";

function getSecret(): string {
  const secret = process.env.CRED_JWT_SECRET;
  if (!secret) throw new Error("Missing CRED_JWT_SECRET env");
  return secret;
}

export async function createCredSession(userId: string) {
  const token = jwt.sign({ sub: userId }, getSecret(), { expiresIn: "14d" });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function destroyCredSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: 0 });
}

export async function getCredUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getSecret()) as { sub?: string };
    const userId = payload.sub;
    if (!userId) return null;
    const user = await prisma.user.findUnique({ where: { id: String(userId) } });
    return user || null;
  } catch {
    return null;
  }
}

export async function verifyDbCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.passwordHash) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return user;
}
