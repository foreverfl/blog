import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth");

  if (!authCookie || typeof authCookie.value !== "string") {
    return new Response(JSON.stringify({ message: "Not authenticated" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    // JWT 토큰 검증
    const decoded = jwt.verify(
      authCookie.value,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload;

    // 검증이 성공하면 사용자 정보 반환
    return new NextResponse(
      JSON.stringify({
        isAuthenticated: true,
        user: {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          photo: decoded.photo,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(`Webhook error: ${errorMessage}`, {
      status: 400,
    });
  }
}
