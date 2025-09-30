import { NextResponse } from "next/server";
import { createCredSession, verifyDbCredentials } from "@/lib/credAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }
    const user = await verifyDbCredentials(String(email), String(password));
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await createCredSession(user.id);
    return NextResponse.json({ success: true, role: user.role });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Login failed" }, { status: 500 });
  }
}
