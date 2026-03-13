import { SignJWT } from "jose";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!process.env.AUTH_PASSWORD || !process.env.AUTH_SECRET) {
      return NextResponse.json(
        { error: "Auth not configured" },
        { status: 503 }
      );
    }

    if (password !== process.env.AUTH_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const token = await new SignJWT({ role: "owner" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({ success: true });
    response.cookies.set("fhf-auth", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
