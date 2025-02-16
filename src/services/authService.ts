import { mockAuthResponses } from '../data/mockAuthData';

const API_BASE_URL = '/api/auth';
const IS_MOCK = true; // Set to true to use mock data

export interface LoginRequest {
    email: string;
    password: string;
    role?: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    user_id: number;
    role: string;
    language?: string;
    message?: string;
}

export const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        if (IS_MOCK) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Return different mock response based on role
            return data.role === 'teacher' ? mockAuthResponses.teacherLoginSuccess : mockAuthResponses.loginSuccess;
        }

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error('Login failed');
        }
        
        return response.json();
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        if (IS_MOCK) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Return different mock response based on role
            return data.role === 'teacher' ? mockAuthResponses.teacherLoginSuccess : mockAuthResponses.loginSuccess;
        }

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        
        return response.json();
    },

    async getProfile(token: string): Promise<any> {
        if (IS_MOCK) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            // Determine role from stored data
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            return userData.role === 'teacher' ? mockAuthResponses.teacherProfile : mockAuthResponses.profile;
        }

        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        return response.json();
    }
};