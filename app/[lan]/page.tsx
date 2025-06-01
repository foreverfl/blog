import React from "react";
import AllCategory from "@/components/main/AllCategory";
import { getAllPostFrontMatters } from "@/lib/content/mdxHelpers";
import { cookies } from "next/headers";

export default async function Index() {
  const cookieStore = await cookies();
  const lan = cookieStore.get("lan")?.value || "ja";
  const frontMatters = await getAllPostFrontMatters(lan);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:w-3/5">
        <AllCategory posts={frontMatters} />
      </div>
    </div>
  );
}
