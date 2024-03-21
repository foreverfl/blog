/** @type {import('next').NextConfig} */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

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
    webpack: (config) => {
        // Alias 설정 추가
        config.resolve.alias['@'] = join(__dirname, 'src');
        config.resolve.alias['@app'] = join(__dirname, 'src/app');

        return config;
    },
};


export default nextConfig;
