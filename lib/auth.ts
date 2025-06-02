import { NextResponse } from "next/server";

export function checkBearerAuth(req: Request, envKey: string) {
  const authHeader = req.headers.get("authorization");
  console.log("authHeader:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const apiKey = process.env[envKey];

  if (!apiKey) {
    console.error(`❌ Environment variable ${envKey} is not set.`);
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  if (token !== apiKey.trim()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return true;
}
