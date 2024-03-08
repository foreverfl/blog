/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https', // 이미지 URL의 프로토콜
                hostname: 'avatars.githubusercontent.com', // 허용할 외부 이미지 호스트 명
            }
        ],

    },
};

export default nextConfig;
