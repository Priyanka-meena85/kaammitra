const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  recipientRole: {
    type: String,
    enum: ["customer", "worker", "admin"],
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  senderRole: {
    type: String,
  },
  type: {
    type: String,
    enum: [
      "booking_created",
      "booking_accepted",
      "booking_rejected",
      "booking_on_the_way",
      "booking_in_progress",
      "booking_completed",
      "booking_cancelled",
      "payment_success",
      "payment_failed",
      "payout_requested",
      "payout_approved",
      "payout_rejected",
      "worker_verification_pending",
      "worker_verified",
      "worker_rejected",
      "complaint_created",
      "complaint_updated",
      "emergency_request",
      "callback_request",
      "chat_message",
      "area_launch_request",
      "system_alert",
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
  },
  link: {
    type: String,
  },
  channels: {
    inApp: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
  },
  status: {
    type: String,
    enum: ["unread", "read", "archived"],
    default: "unread",
  },
  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal",
  },
  deliveryStatus: {
    inApp: { type: String, enum: ["pending", "sent", "failed"], default: "sent" },
    push: { type: String, enum: ["pending", "sent", "failed", "skipped"], default: "skipped" },
    email: { type: String, enum: ["pending", "sent", "failed", "skipped"], default: "skipped" },
    sms: { type: String, enum: ["pending", "sent", "failed", "skipped"], default: "skipped" },
    whatsapp: { type: String, enum: ["pending", "sent", "failed", "skipped"], default: "skipped" },
  },
  readAt: {
    type: Date,
  },
}, { timestamps: true });

notificationSchema.index({ recipientId: 1 });
notificationSchema.index({ recipientRole: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
