"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";

/**
 * AuthProvider — tự động gọi GET /auth/me khi trang tải lần đầu hoặc F5.
 * Nếu có token trong localStorage thì sẽ load user vào Zustand store.
 * Gắn ở Root Layout để áp dụng toàn bộ ứng dụng.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { fetchMe, token } = useAuthStore();

    useEffect(() => {
        // Chỉ gọi khi có token (người dùng đã từng đăng nhập)
        const savedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (savedToken) {
            fetchMe();
        }
    }, []); // Chỉ chạy 1 lần khi mount

    return <>{children}</>;
}
