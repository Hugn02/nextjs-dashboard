const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface RequestOptions extends RequestInit {
    token?: string;
}

function handleSessionExpired() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Chuyển hướng về trang chủ kèm cờ hết phiên để giao diện reset
        window.location.href = '/?session_expired=true';
    }
}

export async function fetchWithAuth(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${BASE_URL}${endpoint}`;

    let response = await fetch(url, {
        ...options,
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

            response = await fetch(url, {
                ...options,
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
