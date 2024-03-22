"use client";

import React, { useEffect, useLayoutEffect } from "react";
import Layout from "@/components/Layout";
import Post from "@/components/Post";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchPostByIndex } from "@/features/post/postSelectedSlice";
import { setCurrentTitle } from "@/features/blog/blogTitleSlice";

export default function Page({ params }: { params: { post: string } }) {
  const postIdx = params.post;

  // Redux
  // 최상위 컴포넌트에서 미리 모든 post 정보를 pre-loading
  const dispatch = useAppDispatch();

  const { currentPost, status } = useAppSelector((state) => state.postSelected);
  const lan = useAppSelector((state) => state.language);

  useLayoutEffect(() => {
    if (currentPost) {
      const title =
        lan.value === "ja" ? currentPost.title_ja : currentPost.title_ko;
      dispatch(setCurrentTitle(title));
    }
  }, [dispatch, currentPost, lan]);

  useLayoutEffect(() => {
    const index = Number(postIdx);
    if (!isNaN(index)) {
      dispatch(fetchPostByIndex(index));
    }
  }, [dispatch, postIdx]);

  return (
    <Layout postIdx={params.post}>
      <Post postIdx={params.post} />
    </Layout>
  );
}
