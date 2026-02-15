import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const data = await getCurrentUser();
            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const syncAnonymousLinks = async () => {
        try {
            const anonymousLinks = JSON.parse(localStorage.getItem('anonymousLinks') || '[]');
            if (anonymousLinks.length > 0) {
                const { claimLinks } = await import('../utils/api');
                await claimLinks(anonymousLinks);
                localStorage.removeItem('anonymousLinks');
                toast.success('Synced your anonymous links!');
            }
        } catch (error) {
            console.error('Failed to sync links:', error);
        }
    };

    const login = async (email, password) => {
        try {
            const data = await apiLogin(email, password);
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            setUser(data.user);
            await syncAnonymousLinks();
            toast.success('Logged in successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Login failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const register = async (email, password) => {
        try {
            const data = await apiRegister(email, password);
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            setUser(data.user);
            await syncAnonymousLinks();
            toast.success('Account created successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Registration failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await apiLogout();
            localStorage.removeItem('authToken');
            setUser(null);
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
