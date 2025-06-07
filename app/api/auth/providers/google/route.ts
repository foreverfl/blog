import { findUserByEmail, upsertUser } from "@/lib/postgres/users";
import { UserCreateDTO } from "@/types/users";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return new NextResponse("Code is required", { status: 400 });
  }

  try {
    // Google에 액세스 토큰 요청
    const accessTokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code: code.toString(),
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
          grant_type: "authorization_code",
        }).toString(),
      },
    );
    const accessTokenData = await accessTokenResponse.json();
    const accessToken = accessTokenData.access_token;

    // Google API를 사용하여 사용자 정보 가져오기
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const googleUserData = await userResponse.json();

    const userData: UserCreateDTO = {
      username: googleUserData.name,
      email: googleUserData.email,
      photo: googleUserData.picture,
      auth_provider: "google",
    };

    await upsertUser(userData);

    const userDataFromDb = await findUserByEmail(userData.email);

    // JWT 토큰 생성
    const jwtToken = jwt.sign(
      {
        userId: userDataFromDb?.id,
        username: userDataFromDb?.username,
        email: userDataFromDb?.email,
        photo: userDataFromDb?.photo,
      }, // 페이로드에 사용자 ID 포함
      process.env.JWT_SECRET!, // Non-null assertion operator
      { expiresIn: "2h" }, // 토큰 만료 시간
    );

    const decoded = jwt.decode(jwtToken); // JWT 내부
    console.log("Decoded JWT:", decoded);

    // 쿠키에서 리다이렉션 링크 찾기
    const preLoginUrl = req.cookies.get("preLoginUrl");
    console.log("preLoginUrl:", preLoginUrl);

    if (!preLoginUrl) {
      return new NextResponse("Cookie has expired. Please try again.", {
        status: 400, // BadRequest
        headers: {
          "Content-Type": "text/plain;charset=UTF-8", // 콘텐츠 타입 명시
        },
      });
    }

    // save JWT to cookie and redirect
    const response = NextResponse.redirect(new URL(preLoginUrl.value, req.url));
    response.cookies.set("auth", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return response;
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
