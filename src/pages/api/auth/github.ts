import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { connectDB } from "../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;
  console.log(code);

  if (!code) {
    return res.status(400).send("Code is required");
  }

  try {
    // GitHub에서 액세스 토큰 요청
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
          code,
        }),
      }
    );
    const accessTokenData = await accessTokenResponse.json();
    const accessToken = accessTokenData.access_token;

    // GitHub API를 사용하여 사용자 정보 가져오기
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });
    const userData = await userResponse.json();

    // userData를 사용하여 데이터베이스에 사용자 정보 저장
    const db = await connectDB();
    db.collection("users").updateOne(
      { id: userData.id },
      { $set: userData },
      { upsert: true }
    );

    // JWT 토큰 생성
    const jwtToken = jwt.sign(
      { userId: userData.id }, // 페이로드에 사용자 ID 포함
      process.env.JWT_SECRET!, // Non-null assertion operator
      { expiresIn: "2h" } // 토큰 만료 시간
    );

    // JWT 내부 확인
    const decoded = jwt.decode(jwtToken);
    console.log(decoded);

    // 쿠키에 JWT 토큰 저장
    res.setHeader(
      "Set-Cookie",
      serialize("auth", jwtToken, {
        secure: process.env.NODE_ENV !== "development",
        maxAge: 7200, // 2시간
        path: "/",
      })
    );

    // 클라이언트에 사용자 데이터 응답
    // res.status(200).json(userData);
    res.writeHead(307, { Location: "/" }).end();
  } catch (error) {
    console.error("Authentication failed:", error);
    res.status(500).send("Internal Server Error");
  }
}
