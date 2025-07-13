import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Handle NextAuth internal logging requests
    const body = await request.json();
    console.log("NextAuth log:", body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("NextAuth log error:", error);
    return NextResponse.json({ success: false });
  }
}
