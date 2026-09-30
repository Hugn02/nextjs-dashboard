import { NewsArticle } from '../types/news.type';
import { getApiBaseUrl } from '@/src/lib/api-config';

const getNewsApiUrl = () => `${getApiBaseUrl()}/news`;

export interface FetchNewsQuery {
    isPublished?: boolean;
    limit?: number;
    page?: number;
}

export interface FetchNewsResponse {
    articles: NewsArticle[];
    totalCount: number;
}

export async function fetchNewsList(query: FetchNewsQuery = {}): Promise<NewsArticle[]> {
    const params = new URLSearchParams();
    if (query.isPublished !== undefined) {
        params.append('isPublished', String(query.isPublished));
    } else {
        // Mặc định ở website chỉ tải bài đã xuất bản
        params.append('isPublished', 'true');
    }

    const res = await fetch(`${getNewsApiUrl()}?${params.toString()}`, {
        next: { tags: ['news'], revalidate: 60 }
    });

    if (!res.ok) {
        throw new Error('Lỗi khi tải danh sách tin tức');
    }

    const data = await res.json();
    // API response format is ApiResponse<NewsResponseDto[]>
    const list = Array.isArray(data) ? data : (data.data || []);
    return list;
}

export async function fetchNewsBySlug(slug: string): Promise<NewsArticle> {
    const res = await fetch(`${getNewsApiUrl()}/slug/${slug}`, {
        next: { tags: ['news'] }
    });

    if (!res.ok) {
        throw new Error(`Không tìm thấy bài viết với slug "${slug}"`);
    }

    const data = await res.json();
    return data.data || data;
}
