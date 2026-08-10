import { useAuthStore } from '@/src/features/auth/hooks/useAuth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface RequestOptions extends RequestInit {
    token?: string;
}

export function handleSessionExpired() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        try {
            useAuthStore.getState().logout();
        } catch (e) {}

        window.dispatchEvent(new Event('auth-state-changed'));

        if (!window.location.search.includes('session_expired=true')) {
            window.location.href = '/?session_expired=true';
        }
    }
}

export async function fetchWithAuth(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${BASE_URL}${endpoint}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = new Headers(options.headers);

    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (response.status === 401 && !url.includes('/auth/refresh-token')) {
        try {
            const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!refreshRes.ok) {
                handleSessionExpired();
                return response;
            }

            const refreshData = await refreshRes.json().catch(() => ({}));
            const newToken = refreshData?.data?.accessToken || refreshData?.accessToken;

            if (newToken && typeof window !== 'undefined') {
                localStorage.setItem('token', newToken);
            }

            const retryHeaders = new Headers(options.headers);
            if (newToken) {
                retryHeaders.set('Authorization', `Bearer ${newToken}`);
            } else if (token) {
                retryHeaders.set('Authorization', `Bearer ${token}`);
            }

            response = await fetch(url, {
                ...options,
                headers: retryHeaders,
                credentials: 'include',
            });

            if (response.status === 401) {
                handleSessionExpired();
            }
        } catch (error) {
            console.error('Failed to auto-refresh access token:', error);
            handleSessionExpired();
        }
    }

    return response;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    const response = await fetchWithAuth(endpoint, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
    }

    return response.json() as Promise<T>;
}

