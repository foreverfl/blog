import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
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
      }
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
      }
    );
    const googleUserData = await userResponse.json();
    console.log(googleUserData);

    // userData를 사용하여 데이터베이스에 사용자 정보 저장
    const db = await connectDB();

    const userData = {
      username: googleUserData.name,
      email: googleUserData.email,
      photo: googleUserData.picture,
      authProvider: "google",
      createdAt: new Date(), // 현재 시간을 설정
    };

    await db.collection("users").updateOne(
      { email: userData.email }, // 이메일을 기준으로 사용자를 찾음
      { $set: userData },
      { upsert: true } // 문서가 없으면 삽입, 있으면 업데이트
    );

    let userDataFromDb = await db
      .collection("users")
      .findOne({ email: userData.email });
    console.log(userDataFromDb);

    // JWT 토큰 생성
    const jwtToken = jwt.sign(
      {
        userId: userDataFromDb?._id,
        username: userDataFromDb?.username,
        email: userDataFromDb?.email,
        photo: userDataFromDb?.photo,
      }, // 페이로드에 사용자 ID 포함
      process.env.JWT_SECRET!, // Non-null assertion operator
      { expiresIn: "2h" } // 토큰 만료 시간
    );

    // JWT 내부 확인
    const decoded = jwt.decode(jwtToken);
    console.log(decoded);

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
