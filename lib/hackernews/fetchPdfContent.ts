import fetch from 'node-fetch';
import pdfParse from 'pdf-parse';

export async function fetchPdfContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    console.log("res:", res);

    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let parsedData;
    try {
      parsedData = await pdfParse(buffer);
      console.log("✅ PDF successfully parsed");
    } catch (err) {
      console.error("❌ pdfParse threw an error:", err);
      return null;
    }

    return "ok";
    
    // const cleanText = parsedData.text
    //   .replace(/[ \t]+\n/g, '\n')
    //   .replace(/\n{3,}/g, '\n\n')
    //   .trim();

    // return cleanText;
  } catch (err) {
    console.error(`PDF fetch error:`, err);
    return null;
  }
}