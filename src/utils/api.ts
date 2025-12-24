import axios from 'axios';

// Use environment variable or fallback to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookie-based auth
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add token to headers
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('doctorToken');
            if (token) {
                console.log('🔑 Adding token to request:', config.url);
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.warn('⚠️ No token found in localStorage for request:', config.url);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            console.error('❌ 401 Unauthorized error:', error.response?.data);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('doctorToken');
                // TEMPORARILY DISABLED - Comment out to debug
                // Only redirect if not already on login page to prevent loop
                // if (!window.location.pathname.includes('/login')) {
                //     console.log('🔒 Unauthorized - redirecting to login');
                //     window.location.href = '/login';
                // }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
export { API_URL };
