import { NextResponse } from "next/server";

/** Returns which OAuth providers are configured (so login page can show/hide Google button). */
export async function GET() {
  const googleEnabled = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  );
  return NextResponse.json({ google: googleEnabled });
}
