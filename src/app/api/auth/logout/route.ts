import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // JWT 토큰을 담고 있는 쿠키 삭제
  const expiredCookie = serialize("auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    expires: new Date(0), // Set the expiration to the past to delete the cookie
    path: "/",
  });

  const response = NextResponse.json({ message: "Successfully logged out" });

  response.headers.set("Set-Cookie", expiredCookie);

  return response;
}
