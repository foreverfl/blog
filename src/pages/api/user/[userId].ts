import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query; // URL에서 userId를 추출합니다.

  try {
    const db = await connectDB();
    const user = await db
      .collection("users")
      .findOne({ id: parseInt(userId as string, 10) });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}
