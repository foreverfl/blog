/** @type {import('next').NextConfig} */

import createMDX from "@next/mdx";

const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  transpilePackages: ["next-mdx-remote"],
  images: {
    remotePatterns: [
      {
        protocol: "https", // 이미지 URL의 프로토콜
        hostname: "avatars.githubusercontent.com", // 허용할 외부 이미지 호스트 명
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "blog_workers.forever-fl.workers.dev",
      },
      {
        protocol: "https",
        hostname: "s4.anilist.co",
      },
      {
        protocol: "http",
        hostname: "k.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "k.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "profile.kakaocdn.net",
      },
    ],
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async rewrites() {
    return [
      {
        source: "/osm/:path*",
        destination: `${process.env.OSM_TILE_HOME_SERVER_URL}/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Docker 환경에서 파일 변경 감지를 위한 polling 설정
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/, // MDX 확장자를 정규식으로 지정
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
