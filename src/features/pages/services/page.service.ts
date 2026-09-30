import { SitePage } from '../types/page.type';
import { getApiBaseUrl } from '@/src/lib/api-config';

const getPagesApiUrl = () => `${getApiBaseUrl()}/pages`;

export async function fetchPageByKey(key: string): Promise<SitePage> {
    try {
        const res = await fetch(`${getPagesApiUrl()}/${key}`, {
            next: { tags: ['pages'], revalidate: 60 },
        });

        if (!res.ok) {
            // Trả về bản ghi rỗng, tránh crash website
            return { key, metadata: {} };
        }

        const json = await res.json();
        return (json.data || json) as SitePage;
    } catch (error) {
        console.error(`Failed to fetch page key ${key}:`, error);
        return { key, metadata: {} };
    }
}

