import { NextApiRequest, NextApiResponse } from "next";
import jwt, { JwtPayload } from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cookies } = req;
  const authCookie = cookies.auth;

  if (!authCookie) {
    return res.status(200).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(
      authCookie,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    if (decoded) {
      res.status(200).json({
        isAuthenticated: true,
        user: {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          photo: decoded.photo,
        },
      });
    } else {
      // 디코드된 정보가 없는 경우
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}
