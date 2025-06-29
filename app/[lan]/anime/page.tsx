import AnimeList from "@/components/organism/anime/AnimeList";

export default async function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:w-3/5">
        <AnimeList />
      </div>
    </div>
  );
}
