import { POST as flushWithDate } from "@/app/api/hackernews/flush/[date]/route";

export async function POST(req: Request) {
  return flushWithDate(req, { params: Promise.resolve({ date: undefined }) });
}
