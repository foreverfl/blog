import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Image
        src="/images/gear.gif"
        width={250}
        height={250}
        alt="loading"
        priority={true}
        className="w-8 w-8 object-fit"
      />
    </div>
  );
}
