import { POST as fetchWithDate } from "./[date]/route";

export async function POST(req: Request) {
  return fetchWithDate(req, { params: Promise.resolve({ date: undefined }) });
}
