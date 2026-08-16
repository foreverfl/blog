import Providers from "@/components/Providers";
import DietContent from "@/components/template/DietContent";

// Single React island for the calorie tracking dashboard.
export default function DietIsland({ lan }: { lan: string }) {
  return (
    <Providers>
      <DietContent lan={lan} />
    </Providers>
  );
}
