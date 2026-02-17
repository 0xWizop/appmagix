import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firebase-session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { method, url, headers, body: reqBody } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    const m = (method || "GET").toUpperCase();
    if (!allowedMethods.includes(m)) {
      return NextResponse.json({ error: "Invalid method" }, { status: 400 });
    }

    const res = await fetch(url, {
      method: m,
      headers: headers && typeof headers === "object" ? headers : undefined,
      body: reqBody && m !== "GET" ? reqBody : undefined,
    });

    const resHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      resHeaders[k] = v;
    });

    const text = await res.text();
    let parsedBody: string;
    try {
      parsedBody = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      parsedBody = text;
    }

    return NextResponse.json({
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
      body: parsedBody,
    });
  } catch (error) {
    console.error("Proxy request error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 500 }
    );
  }
}
