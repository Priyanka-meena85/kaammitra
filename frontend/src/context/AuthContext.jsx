import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const rolePermissions = {
    customer: [
        'profile.read.self', 'profile.update.self', 'worker.read',
        'booking.create', 'booking.read.own', 'booking.cancel.own', 'booking.status.update',
        'payment.create', 'payment.read.own', 'chat.use.related',
        'review.create', 'review.read', 'safety.report', 'settings.manage.self'
    ],
    worker: [
        'profile.read.self', 'profile.update.self', 'verification.submit',
        'availability.manage.self', 'booking.read.assigned', 'booking.accept',
        'booking.reject', 'booking.status.update', 'earnings.read.self', 'wallet.read.self',
        'withdrawal.create.self', 'chat.use.related', 'review.read', 'safety.report',
        'settings.manage.self'
    ],
    admin: [
        'users.read', 'users.manage', 'workers.manage', 'verification.manage',
        'bookings.read', 'bookings.manage', 'payments.read', 'refunds.manage',
        'reviews.moderate', 'safety.manage', 'fraud.manage', 'wallet.manage',
        'analytics.read', 'audit.read', 'platform.manage', 'chat.read.all'
    ]
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_DATA === 'true' && localStorage.getItem('token') === 'dummy_token') {
                setUser({ id: 'demo123', name: 'Demo User', role: 'customer' });
            } else {
                const res = await api.get('/auth/me');
                setUser(res?.data?.data || null);
            }
        } catch (error) {
            console.error('Error fetching user', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const register = (userData, token) => {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const can = (permission) => {
        if (!user || !user.role) return false;
        const userPerms = rolePermissions[user.role];
        return userPerms?.includes(permission) || false;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, hasRole, can }}>
            {children}
        </AuthContext.Provider>
    );
};
