import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";
import { getStorage } from "firebase-admin/storage";
import { adminApp } from "@/lib/firebase-admin";

const MAX_SIZE_MB = 20;

function getBucket() {
  if (!adminApp) throw new Error("Firebase Admin not initialized");
  return getStorage(adminApp).bucket();
}

// GET /api/brand-vault — list user's assets
export async function GET() {
  const session = await getSession();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const bucket = getBucket();
    const prefix = `brand-vault/${uid}/`;
    const [files] = await bucket.getFiles({ prefix });

    const assets = await Promise.all(
      files.map(async (file) => {
        const [metadata] = await file.getMetadata();
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: Date.now() + 1000 * 60 * 60 * 2, // 2 hours
        });
        return {
          id: file.name, // full path as ID
          name: metadata.name?.split("/").pop() || file.name,
          url,
          type: metadata.contentType || "application/octet-stream",
          size: Number(metadata.size) || 0,
          uploadedAt: metadata.timeCreated || "",
        };
      })
    );

    return NextResponse.json({ assets });
  } catch (err: any) {
    console.error("[brand-vault GET]", err);
    return NextResponse.json({ error: err.message || "Failed to list assets" }, { status: 500 });
  }
}

// POST /api/brand-vault — upload a file
export async function POST(req: NextRequest) {
  const session = await getSession();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File too large. Max ${MAX_SIZE_MB}MB.` }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._\-]/g, "_");
    const dest = `brand-vault/${uid}/${Date.now()}_${safeName}`;

    const bucket = getBucket();
    const fileRef = bucket.file(dest);
    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });
    await fileRef.makePublic().catch(() => {}); // optional; signed URLs handle auth

    return NextResponse.json({ ok: true, path: dest });
  } catch (err: any) {
    console.error("[brand-vault POST]", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}

// DELETE /api/brand-vault?id=... — delete a file
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id || !id.startsWith(`brand-vault/${uid}/`)) {
    return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
  }

  try {
    const bucket = getBucket();
    await bucket.file(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[brand-vault DELETE]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
