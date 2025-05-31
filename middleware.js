import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextResponse } from 'next/server';
import { logRequest } from '@/lib/logger';

let locales = ['ja', 'ko']
const defaultLocale = 'ko';

function getLocale(request) {
    const negotiator = new Negotiator({ headers: { 'accept-language': request.headers.get('accept-language') || '' } });
    const languages = negotiator.languages();

    return match(languages, locales, defaultLocale);
}

export function middleware(request) {
    // logging
    logRequest(request);

    const { pathname } = request.nextUrl;
    const [, firstPath, ...restParts] = pathname.split('/');
    const restPath = '/' + restParts.join('/');

    // set cookie if first path is a locale
    if (locales.includes(firstPath)) {
        const response = NextResponse.next();
        response.cookies.set('lan', firstPath, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        });
        return response;
    }

    // when first path is not a locale
    const newPath = `/${defaultLocale}${pathname === '/' ? '' : restPath}`;
    const response = NextResponse.redirect(new URL(newPath, request.url));
    response.cookies.set('lan', defaultLocale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });

    return response;
}

export const config = {
    matcher: [
        // 'api'와 'login'으로 시작하는 경로를 제외하고 모든 경로에 적용
        '/((?!api|login|_next|fonts|category\.json|images|prompts|favicon\.ico|logo|sitemap\.xml|.*\\.txt).*)',
    ],
}