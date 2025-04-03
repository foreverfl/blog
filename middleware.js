import { NextRequest, NextResponse } from 'next/server';
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";

let locales = ['ja', 'ko']
const defaultLocale = 'ko';

// 선호하는 로케일을 가져옴
function getLocale(request) {
    const negotiator = new Negotiator({ headers: { 'accept-language': request.headers.get('accept-language') || '' } });
    const languages = negotiator.languages();

    return match(languages, locales, defaultLocale);
}


export function middleware(request) {
    const { pathname } = request.nextUrl;

    // 경로명에 지원되는 로케일이 있는지 확인함
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return;

    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(request.nextUrl)
}

export const config = {
    matcher: [
        // 'api'와 'login'으로 시작하는 경로를 제외하고 모든 경로에 적용
        '/((?!api|login|_next|fonts|category\.json|images|favicon\.ico|logo|sitemap\.xml|.*\\.txt).*)',
    ],
}