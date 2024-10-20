/** @type {import('next').NextConfig} */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import createMDX from "@next/mdx";
import remarkGfm from 'remark-gfm';
import rehypeSlug from "rehype-slug";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https', // 이미지 URL의 프로토콜
                hostname: 'avatars.githubusercontent.com', // 허용할 외부 이미지 호스트 명
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'blog_workers.forever-fl.workers.dev',
            }
        ],
    },
    pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
    webpack: (config) => {
        // Alias 설정 추가
        return config;
    }
};

const withMDX = createMDX({
    extension: /\.mdx?$/, // MDX 확장자를 정규식으로 지정
    options: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
    },
});

export default withMDX(nextConfig);
