import AnimeList from "@/components/organism/anime/AnimeList";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function Page() {
  const cookieStore = cookies();
  const authCookie = (await cookieStore).get("auth");

  let decoded: jwt.JwtPayload | null = null;

  if (authCookie && typeof authCookie.value === "string") {
    try {
      decoded = jwt.verify(
        authCookie.value,
        process.env.JWT_SECRET!,
      ) as jwt.JwtPayload;
    } catch (error) {
      decoded = null;
    }
  }

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") ?? [];
  const isAuthorized = decoded?.email && adminEmails.includes(decoded.email);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:w-3/5">
        {isAuthorized ? (
          <AnimeList />
        ) : (
          <div className="text-center text-gray-500 mt-20">Access denied</div>
        )}
      </div>
    </div>
  );
}
