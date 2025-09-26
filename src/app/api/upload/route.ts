import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { configureCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const cloudinary = configureCloudinary();
    // For simplicity, expect a JSON body with { dataUri, folder }
    const { dataUri, folder } = await req.json();
    if (!dataUri) return NextResponse.json({ error: "Missing dataUri" }, { status: 400 });

    const res = await cloudinary.uploader.upload(dataUri, {
      folder: folder || "kenya-blog",
      resource_type: "auto",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    return NextResponse.json({ url: res.secure_url, public_id: res.public_id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Upload error" }, { status: 500 });
  }
}
