import { NextRequest, NextResponse } from 'next/server';
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";

let locales = ['ja', 'ko']

// 선호하는 로케일을 가져옴
function getLocale(request) {
    const negotiator = new Negotiator({ headers: { 'accept-language': request.headers.get('accept-language') || '' } });
    const languages = negotiator.languages();
    const defaultLocale = 'ja';

    return match(languages, locales, defaultLocale);
}

export function middleware(request) {
    const { pathname } = request.nextUrl

    const locale = getLocale(request);
    let response = NextResponse.next();
    response.cookies.set('lan', locale);

    // 경로명에 지원되는 로케일이 있는지 확인함
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) {
        return response;
    }

    // 로케일이 없으면 리디렉션
    const url = new URL(`/${locale}${pathname}`, request.url);
    response = NextResponse.redirect(url);

    return response;
}

export const config = {
    matcher: [
        // 'api'와 'login'으로 시작하는 경로를 제외하고 모든 경로에 적용
        '/((?!api|login|_next|fonts|category\.json|images|favicon\.ico|logo|sitemap\.xml).*)',
    ],
}