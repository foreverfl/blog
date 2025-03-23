import { fetchPdfContent } from "./lib/hackernews/fetchPdfContent";


(async () => {
  const result = await fetchPdfContent("https://www.ma.imperial.ac.uk/~dturaev/Mathematical_Methods2021.pdf");
  console.log("결과:", result);
})();