import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Decode JWT payload without a library
const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now();
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Initialize: check localStorage but validate token expiry first
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            if (isTokenExpired(storedToken)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } catch {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
        }

        setLoading(false);
    }, []);

    const login = useCallback((userData, userToken) => {
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));

        if (userData.role === 'admin') navigate('/admin/dashboard');
        else if (userData.role === 'teacher') navigate('/teacher/dashboard');
        else if (userData.role === 'student') navigate('/student/dashboard');
    }, [navigate]);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    }, [navigate]);

    const updateUser = useCallback((newData) => {
        setUser((prev) => {
            const updated = { ...prev, ...newData };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            updateUser,
            isAuthenticated,
            role: user?.role,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
