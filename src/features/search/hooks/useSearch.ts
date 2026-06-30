"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "../../products/types/product.type";
import { searchProducts } from "../services/search.service";

const DEBOUNCE_MS = 400;
const PREVIEW_LIMIT = 5;

export interface UseSearchReturn {
  products: Product[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useSearch(query: string): UseSearchReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Xoá kết quả cũ khi query rỗng
    if (!query || query.trim().length < 2) {
      setProducts([]);
      setTotalCount(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Debounce
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsLoading(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      try {
        const result = await searchProducts({
          name: query.trim(),
          limit: PREVIEW_LIMIT,
          page: 1,
        });
        setProducts(result.products);
        setTotalCount(result.totalCount);
      } catch (err) {
        setError("Không thể tìm kiếm. Vui lòng thử lại.");
        setProducts([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { products, totalCount, isLoading, error };
}
