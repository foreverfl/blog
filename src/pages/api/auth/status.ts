import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = req.headers.cookie;
    if (!cookies) throw new Error("No cookie found");

    const { auth } = parse(cookies);
    if (!auth) throw new Error("No auth token in cookie");

    const decoded = jwt.verify(auth, process.env.JWT_SECRET!);
    if (!decoded) throw new Error("Invalid token");

    res.status(200).json({ message: "Authenticated", decoded });
  } catch (error) {
    res.status(401).json({ message: "Not authenticated", error });
  }
}
