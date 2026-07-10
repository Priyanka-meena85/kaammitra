const Chat = require('../models/Chat');
const Booking = require('../models/Booking');

// GET /api/v1/chats
// Get all chats for the logged in user
exports.getChats = async (req, res) => {
    try {
        let chats;
        if (req.user.role === 'customer') {
            chats = await Chat.find({ customerId: req.user.id }).populate('workerId', 'name profilePhotoUrl');
        } else if (req.user.role === 'worker') {
            chats = await Chat.find({ workerId: req.user.id }).populate('customerId', 'name');
        } else {
            return res.status(403).json({ success: false, message: 'Admins do not have personal chats' });
        }
        res.status(200).json({ success: true, count: chats.length, data: chats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/v1/chats/:conversationId
// Get a specific chat (and verify access)
exports.getChat = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const chat = await Chat.findOne({ conversationId })
            .populate('customerId', 'name')
            .populate('workerId', 'name profilePhotoUrl');

        if (!chat) {
            // Check if they have a booking, if so we allow creating a chat implicitly
            // Extract customerId and workerId from conversationId (format: customerId_workerId)
            const parts = conversationId.split('_');
            if (parts.length === 2) {
                const [cId, wId] = parts;
                
                // Verify authorization
                if ((req.user.role === 'customer' && String(req.user.id) !== cId) ||
                    (req.user.role === 'worker' && String(req.user.id) !== wId)) {
                    return res.status(403).json({ success: false, message: 'Not authorized to access this chat' });
                }

                return res.status(200).json({ success: true, data: { conversationId, messages: [] } });
            }
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        // Verify authorization
        if ((req.user.role === 'customer' && String(chat.customerId) !== String(req.user.id)) ||
            (req.user.role === 'worker' && String(chat.workerId) !== String(req.user.id))) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this chat' });
        }

        res.status(200).json({ success: true, data: chat });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/v1/chats/:conversationId/messages
// Fallback API if socket fails
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: 'Message text is required' });
        }

        const parts = conversationId.split('_');
        if (parts.length !== 2) {
            return res.status(400).json({ success: false, message: 'Invalid conversationId' });
        }
        const [cId, wId] = parts;

        // Verify authorization
        if ((req.user.role === 'customer' && String(req.user.id) !== cId) ||
            (req.user.role === 'worker' && String(req.user.id) !== wId)) {
            return res.status(403).json({ success: false, message: 'Not authorized to send message' });
        }

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
            senderId: req.user.id,
            senderRole: req.user.role,
            text,
            createdAt: new Date(),
            read: false
        };

        chat.messages.push(newMessage);
        await chat.save();

        const receiverId = req.user.role === 'customer' ? wId : cId;
        const receiverRole = req.user.role === 'customer' ? 'worker' : 'customer';
        const { createNotification } = require('../services/notificationService');
        createNotification({
            recipientId: receiverId, recipientRole: receiverRole, type: 'chat_message',
            title: 'New Message', message: 'You have a new message.', link: `/chat/${conversationId}`
        });

        res.status(201).json({ success: true, data: newMessage });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
