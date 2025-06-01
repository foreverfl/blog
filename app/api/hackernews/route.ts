import { GET as getWithDate } from "./[date]/route";

export async function GET(req: Request) {
  return getWithDate(req, { params: Promise.resolve({ date: undefined }) });
}
