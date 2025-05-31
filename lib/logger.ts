import type { NextRequest } from "next/server";

export function logRequest(request: NextRequest, level: string = "info") {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const timestamp =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const country = request.headers.get("cf-ipcountry") || "unknown";
  const ua = request.headers.get("user-agent") || "unknown";
  const referer = request.headers.get("referer") || "none";
  const host = request.headers.get("host") || "unknown";
  const qs = request.nextUrl.search || "";

  const logMsg = `${timestamp} [${level}] ${request.method} ${request.nextUrl.pathname}${qs} from ${ip} (${country}) ua="${ua}" referer="${referer}" host="${host}"`;
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
