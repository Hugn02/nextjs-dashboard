import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Cho phép Admin Portal gọi API này từ domain khác (CORS)
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Xử lý CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
    return handleRevalidate(request);
}

export async function POST(request: NextRequest) {
    return handleRevalidate(request);
}

async function handleRevalidate(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get('tag');
    const tagsParam = searchParams.get('tags');
    const path = searchParams.get('path');
    const secret = searchParams.get('secret');

    // Optional secret verification (default to bat-trang-revalidate-secret if not set in env)
    const expectedSecret = process.env.REVALIDATE_SECRET || 'bat-trang-revalidate-secret';
    if (secret && secret !== expectedSecret) {
        return NextResponse.json(
            { message: 'Invalid secret token' },
            { status: 401, headers: CORS_HEADERS }
        );
    }

    const revalidatedTags: string[] = [];

    if (tag) {
        (revalidateTag as any)(tag);
        revalidatedTags.push(tag);
    }

    if (tagsParam) {
        const splitTags = tagsParam.split(',').map((t) => t.trim()).filter(Boolean);
        for (const t of splitTags) {
            (revalidateTag as any)(t);
            revalidatedTags.push(t);
        }
    }

    if (path) {
        revalidatePath(path);
    }

    if (revalidatedTags.length === 0 && !path) {
        return NextResponse.json(
            { message: 'Missing tag, tags, or path parameter to revalidate' },
            { status: 400, headers: CORS_HEADERS }
        );
    }

    return NextResponse.json(
        {
            revalidated: true,
            tags: revalidatedTags,
            path: path || null,
            now: Date.now(),
        },
        { headers: CORS_HEADERS }
    );
}
