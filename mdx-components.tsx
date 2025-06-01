import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // 기존 컴포넌트 설정을 유지
    ...components,
  };
}
