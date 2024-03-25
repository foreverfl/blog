"use client";

import React, { useEffect, useLayoutEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchPostByIndex } from "@/features/post/postSelectedSlice";

import PostEdit from "@/components/PostEdit";
import Layout from "@/components/Layout";

export default function Page({ params }: { params: { post: string } }) {
  const postIdx = params.post;

  // Redux
  const dispatch = useAppDispatch();

  // 최상위 컴포넌트에서 미리 모든 post 정보를 pre-loading
  useLayoutEffect(() => {
    const index = Number(postIdx);
    if (!isNaN(index)) {
      dispatch(fetchPostByIndex(index));
    }
  }, [dispatch, postIdx]);

  return (
    <Layout postIdx={params.post}>
      <div className="min-h-screen flex justify-center items-center dark:bg-neutral-900">
        <div className="w-full md:w-3/5">
          <PostEdit postIdx={params.post} />
        </div>
      </div>
    </Layout>
  );
}
