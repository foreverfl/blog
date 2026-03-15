import React from "react";
import AllCategory from "@/components/organism/AllCategory";
import { cookies } from "next/headers";

const RUST_API =
  process.env.NEXT_PUBLIC_API_RUST_URL || "http://localhost:8002";

export default async function Index() {
  const cookieStore = await cookies();
  const lan = cookieStore.get("lan")?.value || "en";

  let frontMatters: {
    fileName?: string;
    title: string;
    date: string;
    classification: string;
    category: string;
    image: string;
  }[] = [];

  try {
    const res = await fetch(`${RUST_API}/posts?lang=${lan}&per_page=100`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      frontMatters = data.posts.map(
        (p: {
          slug: string;
          title?: string;
          created_at: string;
          classification: string;
          category: string;
          image?: string;
        }) => ({
          fileName: p.slug,
          title: p.title || "Untitled",
          date: p.created_at.split("T")[0],
          classification: p.classification,
          category: p.category,
          image: p.image || "",
        }),
      );
    }
  } catch (err) {
    console.error("Failed to fetch posts from API:", err);
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:w-3/5">
        <AllCategory posts={frontMatters} />
      </div>
    </div>
  );
}
