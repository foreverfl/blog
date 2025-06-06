import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  // 서비스 계정 정보 로드
  const KEYFILEPATH = path.join(process.cwd(), "key.json");
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });

  const indexing = google.indexing({ version: "v3", auth });

  // 테스트용 URL (실제 사이트에 등록된 주소만 인덱싱 가능)
  const url = "https://mogumogu.dev/ko/trends/hackernews/250324";

  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: "URL_UPDATED",
      },
    });

    return Response.json({ ok: true, data: response.data }, { status: 200 });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
