import { fetchPdfContent } from "../lib/hackernews/fetchPdfContent";

(async () => {
  const startTime = performance.now(); // 시작 시간 기록

  const result = await fetchPdfContent(
    "https://www.ma.imperial.ac.uk/~dturaev/Mathematical_Methods2021.pdf",
  );

  const endTime = performance.now(); // 끝 시간 기록
  const duration = (endTime - startTime) / 1000; // 걸린 시간(초 단위)

  console.log("result: ", result);
  console.log(`❗ Time taken: ${duration.toFixed(2)} seconds`); // 소수점 2자리로 출력
})();
