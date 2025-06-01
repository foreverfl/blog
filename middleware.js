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

    // skip if the request is for a static file or API route
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/fonts') ||
        pathname.startsWith('/images') ||
        pathname.startsWith('/prompts') ||
        pathname.startsWith('/logo') ||
        pathname.startsWith('/login') ||
        pathname === '/category.json' ||
        pathname === '/favicon.ico' ||
        pathname === '/sitemap.xml' ||
        pathname.endsWith('.txt')
    ) {
        return NextResponse.next();
    }
    
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
    const userLocale = getLocale(request);
    const newPath = `/${userLocale}${pathname === '/' ? '' : restPath}`;
    const response = NextResponse.redirect(new URL(newPath, request.url));
    response.cookies.set('lan', userLocale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });

    return response;
}

export const config = {
    matcher: '/:path*'
};