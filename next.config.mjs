/** @type {import('next').NextConfig} */

import createMDX from "@next/mdx";

const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
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
        hostname: "assets.mogumogu.dev",
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
};

const withMDX = createMDX({
  extension: /\.mdx?$/, // MDX 확장자를 정규식으로 지정
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
