import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchPostsByCategory } from "@/features/post/postsSlice";
import Pagination from "@/components/ui/Pagination";
import { resetTitle, setCurrentTitle } from "@/features/blog/blogTitleSlice";

interface Category {
  _id: string;
  name_ko: string;
  name_ja: string;
}

const UserPostList: React.FC = () => {
  // Redux
  const dispatch = useAppDispatch();
  const lan = useAppSelector((state) => state.language);
  const { categories } = useAppSelector((state) => state.category);
  const selectedCategoryId = useAppSelector(
    (state) => state.categorySelected.selectedCategoryId
  );
  const { posts, loading } = useAppSelector((state) => state.post);

  const selectedCategoryName = categories.find(
    (category: Category) => category._id === selectedCategoryId
  )?.[`name_${lan.value}`];

  useEffect(() => {
    if (selectedCategoryName) {
      dispatch(setCurrentTitle(selectedCategoryName)); // 카테고리가 선택되면 타이틀을 업데이트
    }

    return () => {
      dispatch(resetTitle()); // 컴포넌트가 언마운트될 때 초기 타이틀로 리셋
    };
  }, [dispatch, selectedCategoryName]);

  useEffect(() => {
    if (selectedCategoryId) {
      dispatch(fetchPostsByCategory(selectedCategoryId));
    }
  }, [dispatch, selectedCategoryId]);

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(12);

  // 현재 페이지의 포스트를 계산
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber); // 페이지 번호를 클릭했을 때 사용될 함수

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="my-56"></div>

      <div className="mt-10">
        <h1 className="text-5xl font-semibold my-10 text-neutral-800 dark:text-neutral-200 text-center">
          {selectedCategoryName}
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-5 md:px-10">
          {currentPosts.map((post, index) => (
            <div
              key={post._id}
              className="bg-white dark:bg-neutral-800 shadow rounded overflow-hidden aspect-square"
            >
              {/* 이미지 */}
              <div
                className="h-3/4 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${
                    post.imageUrl || "기본 이미지 경로"
                  })`,
                }}
              ></div>
              {/* 날짜 및 제목 */}
              <div className="bg-gray-200 dark:bg-neutral-700 p-4">
                <p className="text-sm dark:text-neutral-300">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <h3 className="font-semibold dark:text-neutral-100">
                  {post[`title_${lan.value}`]}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={posts.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      </div>

      <div className="my-56"></div>
    </>
  );
};

export default UserPostList;
