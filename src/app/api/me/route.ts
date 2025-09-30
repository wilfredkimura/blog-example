import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureDbUser } from "@/lib/ensureDbUser";
import { getCredUser } from "@/lib/credAuth";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (userId) {
    const cu = await currentUser();
    const dbUser = await ensureDbUser(userId, {
      email: cu?.emailAddresses?.[0]?.emailAddress ?? null,
      firstName: cu?.firstName ?? null,
      lastName: cu?.lastName ?? null,
      username: (cu as any)?.username ?? null,
    });
    return NextResponse.json({ id: userId, role: dbUser.role, name: dbUser.name, email: dbUser.email, source: "clerk" });
  }
  // Fallback to DB credential session
  const credUser = await getCredUser();
  if (credUser) {
    return NextResponse.json({ id: credUser.id, role: credUser.role, name: credUser.name, email: credUser.email, source: "cred" });
  }
  return NextResponse.json({ user: null, role: null, source: null }, { status: 200 });
}
