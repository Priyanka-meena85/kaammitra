const jwt = require('jsonwebtoken');
const Chat = require('./models/Chat');
const Booking = require('./models/Booking');

// Store online users: map userId to socketId
const onlineUsers = new Map();

module.exports = (io) => {
    // Authentication Middleware for Socket.io
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // { id, role, iat, exp }
            next();
        } catch (err) {
            return next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user.id;
        const userRole = socket.user.role;
        onlineUsers.set(userId, socket.id);
        
        // Join notification room for this specific user
        socket.join(`${userRole}:${userId}`);
        
        // Broadcast user online
        io.emit('user_online', { userId });

        // Join Chat
        socket.on('join_chat', async ({ conversationId }) => {
            const parts = conversationId.split('_');
            if (parts.length === 2) {
                const [cId, wId] = parts;
                // Security check
                if ((socket.user.role === 'customer' && String(userId) !== cId) ||
                    (socket.user.role === 'worker' && String(userId) !== wId)) {
                    socket.emit('error', { message: 'Not authorized to join this chat' });
                    return;
                }
                
                // Allow join if customer has booking with worker, OR chat already exists (or initiated from profile)
                // We'll trust the user if they pass the ID check as per requirements
                socket.join(conversationId);
            }
        });

        // Send Message
        socket.on('send_message', async ({ conversationId, text }) => {
            const parts = conversationId.split('_');
            if (parts.length !== 2) return;
            const [cId, wId] = parts;
            
            // Security check
            if ((socket.user.role === 'customer' && String(userId) !== cId) ||
                (socket.user.role === 'worker' && String(userId) !== wId)) {
                return;
            }

            try {
                let chat = await Chat.findOne({ conversationId });
                if (!chat) {
                    chat = new Chat({
                        conversationId,
                        customerId: cId,
                        workerId: wId,
                        messages: []
                    });
                }

                const newMessage = {
                    senderId: userId,
                    senderRole: socket.user.role,
                    text,
                    createdAt: new Date(),
                    read: false
                };

                chat.messages.push(newMessage);
                await chat.save();

                // Broadcast to room
                io.to(conversationId).emit('receive_message', { conversationId, message: newMessage });

                const receiverId = socket.user.role === 'customer' ? wId : cId;
                const receiverRole = socket.user.role === 'customer' ? 'worker' : 'customer';
                const { createNotification } = require('./services/notificationService');
                
                createNotification({
                    recipientId: receiverId, recipientRole: receiverRole, type: 'chat_message',
                    title: 'New Message', message: 'You have a new message.', link: `/chat/${conversationId}`, io
                });
            } catch (err) {
                console.error('Send message error:', err);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing events
        socket.on('typing', ({ conversationId }) => {
            socket.to(conversationId).emit('typing', { conversationId, userId });
        });

        socket.on('stop_typing', ({ conversationId }) => {
            socket.to(conversationId).emit('stop_typing', { conversationId, userId });
        });

        // Mark read
        socket.on('mark_read', async ({ conversationId }) => {
            try {
                const chat = await Chat.findOne({ conversationId });
                if (chat) {
                    let updated = false;
                    chat.messages.forEach(msg => {
                        if (String(msg.senderId) !== String(userId) && !msg.read) {
                            msg.read = true;
                            updated = true;
                        }
                    });
                    if (updated) {
                        await chat.save();
                        io.to(conversationId).emit('messages_read', { conversationId, readBy: userId });
                    }
                }
            } catch (err) {
                console.error('Mark read error:', err);
            }
        });

        // Geolocation Tracking
        socket.on('subscribe_location', ({ bookingId }) => {
            socket.join(`location_${bookingId}`);
        });

        socket.on('unsubscribe_location', ({ bookingId }) => {
            socket.leave(`location_${bookingId}`);
        });

        socket.on('location_update', ({ bookingId, location }) => {
            socket.to(`location_${bookingId}`).emit('worker_location_update', { bookingId, location });
        });

        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            io.emit('user_offline', { userId });
        });
    });
};

module.exports.getOnlineUsers = () => onlineUsers;
module.exports.getIo = () => ioInstance; // We'll set this from server.js

let ioInstance;
module.exports.setIo = (io) => {
    ioInstance = io;
};
