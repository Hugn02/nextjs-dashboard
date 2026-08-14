import { create } from 'zustand';
import { User } from '@/src/features/auth/types/auth.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export type { User };

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoadingUser: boolean;
    // Đặt user từ bên ngoài (sau khi gọi /auth/me)
    setUser: (user: User | null) => void;
    // Gọi GET /auth/me để lấy user từ server
    fetchMe: () => Promise<void>;
    // Sau khi login thành công: chỉ lưu token, KHÔNG lưu user
    login: (token: string) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
    isLoadingUser: false,

    setUser: (user) => {
        set({ user, isAuthenticated: !!user });
    },

    fetchMe: async () => {
        set({ isLoadingUser: true });
        try {
            const res = await fetch(`${BASE_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                // Backend trả về data trực tiếp hoặc bọc trong { data: ... }
                const user: User = data?.data ?? data;
                set({ user, isAuthenticated: true, token: typeof window !== 'undefined' ? localStorage.getItem('token') : null });
            } else if (res.status === 401) {
                // Token hết hạn — thử refresh
                const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
                    method: 'POST',
                    credentials: 'include',
                });
                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    const newToken = refreshData?.data?.accessToken || refreshData?.accessToken;
                    if (newToken) {
                        localStorage.setItem('token', newToken);
                        set({ token: newToken });
                        // Thử lại /auth/me với token mới
                        await get().fetchMe();
                        return;
                    }
                }
                // Refresh thất bại — xóa token, logout
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            } else {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            }
        } catch (err) {
            console.error('fetchMe error:', err);
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isLoadingUser: false });
        }
    },

    login: async (token: string) => {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: true });
        // Lấy thông tin user từ server
        await get().fetchMe();
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth-state-changed'));
        }
    },
}));
