import Layout from "@/components/Layout";
import Post from "@/components/Post";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { post: string } }) {
  const postIdx = params.post;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/post/${postIdx}`);
  const post = await response.json();

  if (!response.ok) {
    return notFound();
  }
  return (
    <Layout postIdx={params.post}>
      <Post postIdx={params.post} post={post} />
    </Layout>
  );
}
