import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  data: { name: string }[]; // DataItem[] 타입에 맞춰 데이터 구조를 정의
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.status(200).json({
    data: [{ name: "가나다" }, { name: "라마바" }, { name: "사아자" }],
  });
}
