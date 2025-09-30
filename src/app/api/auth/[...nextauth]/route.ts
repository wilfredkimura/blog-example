export const runtime = "nodejs";

export async function GET() {
  return new Response("NextAuth is disabled. Use Clerk.", { status: 410 });
}

export async function POST() {
  return new Response("NextAuth is disabled. Use Clerk.", { status: 410 });
}
