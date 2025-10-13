import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextResponse } from "next/server";
import { logRequest } from "@/lib/logger";

let locales = ["en", "ja", "ko"];
const defaultLocale = "ko";

function getLocale(request) {
  try {
    const acceptLanguage = request.headers.get("accept-language") || "";

    // Handle empty or invalid accept-language header
    if (!acceptLanguage || acceptLanguage.trim() === "") {
      return defaultLocale;
    }

    const negotiator = new Negotiator({
      headers: {
        "accept-language": acceptLanguage,
      },
    });

    const languages = negotiator.languages();

    // Validate languages array before matching
    if (!languages || languages.length === 0) {
      return defaultLocale;
    }

    // Filter out invalid language codes (e.g., "*", empty strings)
    const validLanguages = languages.filter(
      (lang) =>
        lang && lang !== "*" && /^[a-zA-Z]{2,3}(-[a-zA-Z]{2,4})?$/.test(lang),
    );

    if (validLanguages.length === 0) {
      return defaultLocale;
    }

    return match(validLanguages, locales, defaultLocale);
  } catch (error) {
    console.error("Error in getLocale:", error);
    return defaultLocale;
  }
}

export function middleware(request) {
  try {
    // logging
    logRequest(request);

    const { pathname } = request.nextUrl;

    // skip if the request is for a static file or API route
    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/fonts") ||
      pathname.startsWith("/images") ||
      pathname.startsWith("/prompts") ||
      pathname.startsWith("/logo") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/policy") ||
      pathname.startsWith("/monitoring") || // Sentry tunnel route for ad-blocker circumvention
      pathname.startsWith("/sentry-test") || // Sentry test page
      pathname === "/category.json" ||
      pathname === "/favicon.ico" ||
      pathname === "/sitemap.xml" ||
      pathname.endsWith(".txt")
    ) {
      return NextResponse.next();
    }

    const [, firstPath, ...restParts] = pathname.split("/");
    const restPath = "/" + restParts.join("/");

    // set cookie if first path is a locale
    if (locales.includes(firstPath)) {
      const response = NextResponse.next();
      response.cookies.set("lan", firstPath, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }

    // when first path is not a locale
    const userLocale = getLocale(request);
    const newPath = `/${userLocale}${pathname === "/" ? "" : restPath}`;
    const response = NextResponse.redirect(new URL(newPath, request.url));
    response.cookies.set("lan", userLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // Return next() on any error to prevent blocking the request
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/:path*",
};
