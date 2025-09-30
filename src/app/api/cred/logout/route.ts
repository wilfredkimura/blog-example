import { NextResponse } from "next/server";
import { destroyCredSession } from "@/lib/credAuth";

export const runtime = "nodejs";

export async function POST() {
  await destroyCredSession();
  return NextResponse.json({ success: true });
}
