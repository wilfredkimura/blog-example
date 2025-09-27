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
    const form = await req.formData();
    const file = form.get("file");
    const folder = (form.get("folder") as string) || "kenya-blog";
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    const blob = file as File;
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cloudinary = configureCloudinary();
    const publicIdBase = blob.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_\/-]+/g, "_");

    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto", public_id: publicIdBase, unique_filename: true, overwrite: false },
        (err: any, result: any) => {
          if (err) return reject(err);
          if (!result?.secure_url || !result?.public_id) return reject(new Error("Invalid Cloudinary response"));
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: uploadResult.secure_url, public_id: uploadResult.public_id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const publicIdParam = searchParams.get("public_id");
    const url = searchParams.get("url");
    const cloudinary = configureCloudinary();

    let publicId = publicIdParam || "";
    if (!publicId && url) {
      try {
        // Parse Cloudinary public_id from URL like:
        // https://res.cloudinary.com/<cloud>/image/upload/v123456789/folder/name.ext
        const u = new URL(url);
        const parts = u.pathname.split("/").filter(Boolean);
        // parts: ["<cloudinary_res_type>", "upload", "v123456", ...folderAndName]
        const vIndex = parts.findIndex((p) => /^v\d+$/i.test(p));
        const pathAfterVersion = vIndex >= 0 ? parts.slice(vIndex + 1) : parts.slice(2);
        publicId = pathAfterVersion.join("/").replace(/\.[^.]+$/, "");
      } catch {
        // ignore
      }
    }

    if (!publicId) {
      return NextResponse.json({ error: "Missing public_id or unable to parse from url" }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId, { invalidate: true });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Delete failed" }, { status: 500 });
  }
}
