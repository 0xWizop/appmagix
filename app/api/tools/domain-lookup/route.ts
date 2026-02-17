import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") || searchParams.get("domain");
  if (!url) {
    return NextResponse.json({ error: "url or domain required" }, { status: 400 });
  }

  const normalized = url.startsWith("http") ? url : `https://${url}`;
  try {
    const res = await fetch(normalized, {
      headers: { "User-Agent": "MerchantMagix-Tools/1.0" },
    });
    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const ogTitleMatch = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
    );
    const ogDescMatch = html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
    );

    return NextResponse.json({
      url: normalized,
      title: titleMatch?.[1]?.trim() || ogTitleMatch?.[1]?.trim() || null,
      description:
        descMatch?.[1]?.trim() || ogDescMatch?.[1]?.trim() || null,
      status: res.status,
    });
  } catch (err) {
    console.error("Domain lookup error:", err);
    return NextResponse.json(
      { error: "Could not fetch URL" },
      { status: 500 }
    );
  }
}
