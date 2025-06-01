import { POST as commonPOST } from "./[date]/route";

export async function POST(req: Request) {
  return commonPOST(req, {
    params: Promise.resolve({ date: undefined }),
    searchParams: new URL(req.url).searchParams,
  });
}
