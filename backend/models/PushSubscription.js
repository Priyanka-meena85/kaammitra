const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  role: {
    type: String,
    enum: ["customer", "worker", "admin"],
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  userAgent: {
    type: String,
  }
}, { timestamps: true });

pushSubscriptionSchema.index({ userId: 1, role: 1 });

module.exports = mongoose.model("PushSubscription", pushSubscriptionSchema);
