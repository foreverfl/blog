import { fetchPdfContentLocal } from "../lib/hackernews/fetchPdfContent";

(async () => {
  const result = await fetchPdfContentLocal("./test-data/test.pdf");
  console.log("result: ", result);
})();
