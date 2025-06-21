// components/organism/CategoryEmpty.tsx

export default function CategoryEmpty({
  categoryName,
}: {
  categoryName?: string;
}) {
  return (
    <>
      <div className="my-56"></div>

      <div className="flex flex-col items-center justify-center min-h-[40vh] py-20 text-neutral-400">
        <span className="text-4xl mb-4">🥲</span>
        <div className="text-xl">
          {categoryName ? (
            <>
              No posts yet in <span className="font-bold">{categoryName}</span>.
            </>
          ) : (
            <>No posts found.</>
          )}
        </div>
      </div>

      <div className="my-56"></div>
    </>
  );
}
