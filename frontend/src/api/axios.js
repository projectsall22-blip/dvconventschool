import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 15000, // 15s timeout to avoid hanging requests
});

// REQUEST INTERCEPTOR: Attach token automatically
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handle expired/invalid tokens
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't redirect if already on a public/auth page
            const publicPaths = ['/', '/login', '/register'];
            const isPublic = publicPaths.some((p) => window.location.pathname.startsWith(p));

            if (!isPublic) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
            }
        }

        // Normalize error message for easier consumption in components
        const message =
            error.response?.data?.message ||
            error.message ||
            'Something went wrong. Please try again.';

        return Promise.reject(new Error(message));
    }
);

export default API;
