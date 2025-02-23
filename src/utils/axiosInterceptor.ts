import { authService } from '@/services/authService';

export async function fetchWithTokenRefresh(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('token');
    
    if (token && authService.isTokenExpired(token)) {
        try {
            const refreshResponse = await authService.refreshToken();
            if (refreshResponse.access_token) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${refreshResponse.access_token}`
                };
            }
        } catch (error) {
            // If refresh fails, redirect to login
            window.location.href = '/select-role';
            throw new Error('Session expired');
        }
    } else if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }

    const response = await fetch(url, options);
    
    if (response.status === 401) {
        try {
            const refreshResponse = await authService.refreshToken();
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${refreshResponse.access_token}`
            };
            return fetch(url, options);
        } catch (error) {
            window.location.href = '/select-role';
            throw new Error('Session expired');
        }
    }
    
    return response;
}
