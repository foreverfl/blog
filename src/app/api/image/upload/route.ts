import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";

const pump = promisify(pipeline);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file: any = formData.getAll("files")[0];
    console.log(file);

    // 파일명 변경 로직
    const timestamp = Date.now(); // 현재 타임스탬프를 사용하여 유니크한 순번 생성
    const originalFileName = file.name; // 원본 파일명
    const safeFileName = path.basename(originalFileName).replace(/\s+/g, "_"); // 파일명에 공백이나 특수문자가 있을 경우를 대비해 path 모듈의 basename 함수를 사용하여 처리
    const newFileName = `tmp_${timestamp}_${safeFileName}`;
    const filePath = `C://bucket/${newFileName}`;

    await pump(file.stream(), fs.createWriteStream(filePath));
    return NextResponse.json({ status: "success", url: filePath });
  } catch (e) {
    return NextResponse.json({ status: "fail", data: e });
  }
}
