import Providers from "@/components/Providers";
import GithubRank from "@/components/github/GithubRank";

// Single React island for the /{lan}/trends/github page.
export default function GithubRankIsland({ lan }: { lan: string }) {
  return (
    <Providers>
      <GithubRank lan={lan} />
    </Providers>
  );
}
