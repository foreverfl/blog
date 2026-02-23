"use client";

import AudioLab from "@/components/organism/playground/AudioLab";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:w-3/5">
        <AudioLab />
      </div>
    </div>
  );
}
