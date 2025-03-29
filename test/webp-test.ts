import { convertImagesToWebp } from '@/lib/image-to-webp';
import path from 'path';

// 즉시 실행 함수 (IIFE)로 실행
(async () => {
  const sourceDir = path.join(process.cwd(), 'public', 'images', 'hackernews');
  const destDir = path.join(process.cwd(), 'public', 'images', 'hackernews-webp');

  try {
    // 이미지 변환 함수 호출
    await convertImagesToWebp(sourceDir, destDir);
  } catch (error) {
    console.error('❌ Error during the image conversion process:', error);
  }
})();