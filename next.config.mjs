/** @type {import('next').NextConfig} */

import { withSentryConfig } from "@sentry/nextjs";
import createMDX from "@next/mdx";

const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  transpilePackages: ["next-mdx-remote", "react-joyride", "react-floater"],
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
    ],
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
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

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  // Organization and project slug from your Sentry account
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Will create a release and upload source maps automatically
  widenClientFileUpload: true,
  // Transpiles SDK for compatibility with IE11 (if needed)
  transpileClientSDK: true,
  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  // Disable debug logging via tree shaking
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
};

// Wrap MDX config with Sentry config
const mdxConfig = withMDX(nextConfig);

export default withSentryConfig(mdxConfig, sentryWebpackPluginOptions);
