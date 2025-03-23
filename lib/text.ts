async function loadTiktoken() {
  const tiktoken = await import("tiktoken");
  return tiktoken.get_encoding("cl100k_base");
}

/**
 * 토큰 수 계산
 */
export async function countTokens(text: string): Promise<number> {
  try {
    const enc = await loadTiktoken();
    return enc.encode(text).length;
  } catch (error) {
    console.log("❌ Tokenization failed. Skipping file...", error);
    return 0;
  }
}

/**
 * 단어 수 계산
 */
export function countWords(text: string): number {
  return text.split(/\s+/).length;
}

/**
 * 토큰 수가 maxTokens를 초과하면 텍스트 자르기
 */
export async function sliceTextByTokens(
  text: string,
  maxTokens: number = 15000
): Promise<string> {
  const wordCount = countWords(text);
  console.log("The number of words:", wordCount);

  const tokenCount = await countTokens(text);
  console.log("The number of tokens:", tokenCount);

  if (tokenCount <= maxTokens) {
    return text;
  }

  let start = 0;
  let end = countWords(text);

  // Binary search
  while (start <= end ) {
    const mid = Math.floor((start + end) / 2);
    const currentText = text.slice(0, mid);
    const currentTokenCount = await countTokens(currentText);

    console.log(`Words (mid): ${mid}, Tokens: ${currentTokenCount}`);

    if (currentTokenCount === maxTokens) {
      return currentText; 
    } else if (currentTokenCount <= maxTokens) {
      start = mid + 1;
    } else {
      end = mid; 
    }
  }

  const finalText = text.slice(0, start);
  const finalTokenCount = await countTokens(finalText); 
  console.log("Final Token Count after slicing:", finalTokenCount);

  return finalText;
}
