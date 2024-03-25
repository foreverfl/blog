type UploadResponse = {
  urls: string[];
  errors: string[];
};

export const uploadFiles = async (
  files: FileList,
  prefix: string
): Promise<UploadResponse> => {
  const uploadPromises = Array.from(files).map(async (file) => {
    // 타임 스탬프 및 파일명 처리 로직
    const now = new Date();
    const formattedDate = now
      .toLocaleDateString("ko-KR", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\.\s?/g, "");

    const formattedTime = now
      .toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/:/g, "");

    const formattedTimestamp = `${formattedDate}-${formattedTime}`;
    const originalFileName = file.name;
    const safeFileName = originalFileName.replace(/\s+/g, "_");
    const newFileName = `${prefix}_${formattedTimestamp}_${safeFileName}`;

    // 업로드 요청
    try {
      const formData = new FormData();
      formData.append("file", file, newFileName);
      const requestOptions = { method: "PUT", body: formData.get("file") };
      const response = await fetch(
        `https://blog_workers.forever-fl.workers.dev/${newFileName}`,
        requestOptions
      );

      if (!response.ok) throw new Error("Upload failed");

      return {
        url: `https://blog_workers.forever-fl.workers.dev/${newFileName}`,
      };
    } catch (error) {
      return { error: error };
    }
  });

  const results = await Promise.all(uploadPromises);

  return results.reduce<UploadResponse>(
    (acc, curr) => {
      if ("url" in curr && curr.url !== undefined) {
        // url 존재 여부 확인
        acc.urls.push(curr.url);
      } else if ("error" in curr) {
        // error 존재 여부 확인
        const errorMessage =
          typeof curr.error === "object" &&
          curr.error !== null &&
          "message" in curr.error
            ? (curr.error as Error).message
            : String(curr.error);
        acc.errors.push(errorMessage);
      }
      return acc;
    },
    { urls: [], errors: [] }
  );
};

export const renameAndOverwriteFiles = async (
  uploadedImageUrls: string[],
  prefixBefore: string,
  prefixAfter: string
): Promise<{ imageUrls: string[] }> => {
  const renameFile = async (imageUrl: string): Promise<string> => {
    const urlParts = imageUrl.split("/");
    const originalFileName = urlParts.pop();
    const newFileName = originalFileName!.replace(prefixBefore, prefixAfter);
    const newImageUrl = `https://blog_workers.forever-fl.workers.dev/${newFileName}`;

    const fileResponse = await fetch(imageUrl);
    if (!fileResponse.ok) {
      console.error(`Failed to fetch original file: ${imageUrl}`);
      throw new Error(`Failed to fetch original file: ${imageUrl}`);
    }
    const fileBlob = await fileResponse.blob();

    const putResponse = await fetch(newImageUrl, {
      method: "PUT",
      body: fileBlob,
    });

    if (!putResponse.ok) {
      console.error(`Failed to overwrite file: ${newFileName}`);
      throw new Error(`Failed to overwrite file: ${newFileName}`);
    }

    return newImageUrl; // 새 이미지 URL 반환
  };

  // 이미지들의 이름 변경
  const newImageUrls = await Promise.all(
    uploadedImageUrls.map((imageUrl) => renameFile(imageUrl))
  );

  return {
    imageUrls: newImageUrls,
  };
};

export const deleteImage = async (imageLink: string): Promise<boolean> => {
  try {
    const fileName = imageLink.split("/").pop(); // URL에서 파일 이름 추출
    if (!fileName) throw new Error("Invalid URL");

    const requestOptions = { method: "DELETE" };
    const response = await fetch(
      `https://blog_workers.forever-fl.workers.dev/${fileName}`,
      requestOptions
    );

    if (!response.ok) throw new Error("Failed to delete image");

    return true; // 성공적으로 삭제 처리
  } catch (error) {
    console.error("Delete error:", error);
    return false; // 삭제 실패
  }
};
