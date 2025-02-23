import api from './apiConfig';

interface User {
  id: string;
  role: 'teacher' | 'parent';
  email: string;
  name?: string;
  [key: string]: any;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: 'teacher' | 'parent';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      // First, authenticate user
      const response = await api.post('/login', data);
      console.log('Login response:', response.data);
      
      const token = response.data.access_token || response.data.token;
      
      // Store token first for subsequent requests
      localStorage.setItem('token', token);

      try {
        // Fetch complete user details after successful login
        const userResponse = await api.get('/user');
        console.log('User details response:', userResponse.data);

        const userData = {
          ...userResponse.data,
          role: data.role, // Ensure role is included
        };

        // Store complete user data
        localStorage.setItem('userData', JSON.stringify(userData));
        
        return { 
          token, 
          user: userData
        };

      } catch (userError) {
        console.error('Error fetching user details:', userError);
        // If user details fetch fails, store basic info
        const basicUserData = {
          email: data.email,
          role: data.role,
          id: response.data.user?.id || 'temp-id'
        };
        localStorage.setItem('userData', JSON.stringify(basicUserData));
        return { token, user: basicUserData };
      }

    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  getUserData: async () => {
    const response = await api.get('/user');
    console.log('User data:', response.data);
    return response.data;
    
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    if (!token || !userData) return false;
    try {
      const user = JSON.parse(userData);
      return Boolean(user && user.role);
    } catch {
      return false;
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) return null;
      const user = JSON.parse(userData);
      return user && user.role ? user : null;
    } catch {
      return null;
    }
  }
};