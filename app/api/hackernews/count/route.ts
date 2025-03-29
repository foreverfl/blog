// app/api/hackernews/count/route.ts

import { GET as CountWithDate } from "./[date]/route";

export async function GET(req: Request) {
  return CountWithDate(req, { params: Promise.resolve({ date: undefined }) });
}
