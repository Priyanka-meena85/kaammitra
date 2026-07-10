import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        // Remove /api/v1 from base URL for socket connection if present
        let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        if (baseUrl.endsWith('/api/v1')) {
            baseUrl = baseUrl.slice(0, -7);
        }

        if (user && token) {
            const socketInstance = io(baseUrl, {
                auth: { token }
            });

            socketInstance.on('connect', () => {
                console.log('Socket connected:', socketInstance.id);
            });

            socketInstance.on('user_online', ({ userId }) => {
                setOnlineUsers(prev => new Set([...prev, userId]));
            });

            socketInstance.on('user_offline', ({ userId }) => {
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        } else if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
