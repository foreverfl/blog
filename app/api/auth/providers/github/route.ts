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
    // GitHub에 액세스 토큰 요청
    const accessTokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          redirect_uri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI,
          code,
        }),
      },
    );
    const accessTokenData = await accessTokenResponse.json();
    const accessToken = accessTokenData.access_token;

    // GitHub API를 사용하여 사용자 정보 가져오기
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });
    const githubUserData = await userResponse.json();

    const userData: UserCreateDTO = {
      username: githubUserData.login, // name은 null일 수 있음
      email: githubUserData.email,
      photo: githubUserData.avatar_url,
      auth_provider: "github",
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
      },
      process.env.JWT_SECRET!, // Non-null assertion operator
      { expiresIn: "2h" }, // 토큰 만료 시간
    );

    // JWT 내부 확인
    const decoded = jwt.decode(jwtToken);

    // 쿠키에 JWT 토큰 저장
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.set("auth", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7200, // 2시간
      path: "/",
    });

    return response;
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
