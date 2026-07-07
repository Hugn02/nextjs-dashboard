import { useState, useEffect } from "react";

export interface CategoryOption {
    _id?: string;
    id?: string;
    name: string;
    slug: string;
    isActive?: boolean;
}

export interface CollectionOption {
    _id?: string;
    id?: string;
    name: string;
    slug: string;
    isActive?: boolean;
}

export function useProductFilterOptions() {
    const [collections, setCollections] = useState<CollectionOption[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";
                const [colRes, catRes] = await Promise.all([
                    fetch(`${apiUrl}/collections?isActive=true`),
                    fetch(`${apiUrl}/categories?isActive=true`),
                ]);

                if (colRes.ok) {
                    const colData = await colRes.json();
                    const list: CollectionOption[] = Array.isArray(colData) ? colData : colData.data || [];
                    setCollections(list.filter((c) => c.isActive !== false));
                }
                if (catRes.ok) {
                    const catData = await catRes.json();
                    const list: CategoryOption[] = Array.isArray(catData) ? catData : catData.data || [];
                    setCategories(list.filter((c) => c.isActive !== false));
                }
            } catch (err) {
                console.error("Lỗi fetch options bộ lọc:", err);
            } finally {
                setLoading(false);
            }
        };
        loadFilterOptions();
    }, []);

    return { collections, categories, loading };
}
