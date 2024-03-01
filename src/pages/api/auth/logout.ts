import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function logout(req: NextApiRequest, res: NextApiResponse) {
  // JWT 토큰을 담고 있는 쿠키 삭제
  res.setHeader(
    "Set-Cookie",
    serialize("auth", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      expires: new Date(0), // 쿠키 만료 시간을 과거로 설정하여 삭제
      path: "/",
    })
  );

  res.status(200).json({ message: "Successfully logged out" });
}
