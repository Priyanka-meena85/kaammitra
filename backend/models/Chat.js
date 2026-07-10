const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.ObjectId,
        required: true
    },
    senderRole: {
        type: String,
        enum: ['customer', 'worker', 'admin'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ChatSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
        unique: true
    },
    customerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: true
    },
    workerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Worker',
        required: true
    },
    messages: [MessageSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', ChatSchema);
