import { SitePage } from '../types/page.type';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/pages`;

export async function fetchPageByKey(key: string): Promise<SitePage> {
    const res = await fetch(`${API_URL}/${key}`, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        // Trả về bản ghi rỗng, tránh crash website
        return { key, metadata: {} };
    }

    const json = await res.json();
    return (json.data || json) as SitePage;
}
