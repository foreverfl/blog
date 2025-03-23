/** @type {import('next').NextConfig} */

import createMDX from "@next/mdx";
import rehypeSlug from "rehype-slug";
import remarkGfm from 'remark-gfm';

const nextConfig = {
    transpilePackages: ['next-mdx-remote'],
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
        return config; // Alias 설정 추가
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
