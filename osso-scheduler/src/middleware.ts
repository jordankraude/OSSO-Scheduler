import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

interface AuthToken {
    email: string;
    picture: string | null;
    sub: string;
    firstname: string | null;
    lastname: string | null;
    image: string | null;
    isAdmin: boolean;
    isVolunteerDirector: boolean;
    iat: number; // issued at
    exp: number; // expiration time
    jti: string;
}

export async function middleware(req: NextRequest) {
    const token = (await getToken({ req })) as AuthToken | null;

    if (!token) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Check if the token has expired
    if (Date.now() >= (token.exp * 1000)) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Check if the user has admin privileges
    if (!token.isAdmin && !token.isVolunteerDirector) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
}

// This middleware will apply to all paths, you can specify paths if needed
export const config = {
    matcher: ['/dashboard/:path*'], // Only run on /admin and its subpaths
};
