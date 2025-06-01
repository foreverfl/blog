type Props = {
  src: string;
  alt: string;
  className?: string;
};

export default function ImageWithEnv({ src, alt, className }: Props) {
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://mogumogu.dev";

  return (
    <img
      src={`${baseUrl}${src}`}
      alt={alt}
      className={className || ""}
      loading="lazy"
    />
  );
}
