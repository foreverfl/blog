import type { NextRequest } from "next/server";

export function logRequest(request: NextRequest, level: string = "info") {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const timestamp =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  const logMsg = `${timestamp} [${level}] ${request.method} ${request.nextUrl.pathname} from ${ip}`;
  console.log(logMsg);
}

export function logMessage(message: string, level: string = "info") {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const timestamp =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const logMsg = `${timestamp} [${level}] ${message}`;
  console.log(logMsg);
}
