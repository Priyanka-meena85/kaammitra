const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const NotificationPreference = require("../models/NotificationPreference");
const PushSubscription = require("../models/PushSubscription");
const { protect } = require("../middlewares/auth");

// Utility to determine if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Not authorized as admin" });
  }
};

// GET /api/v1/notifications
// Get user's notifications with pagination
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = { recipientId: req.user._id, recipientRole: req.user.role };

    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;
    // Don't fetch archived by default unless specifically asked
    if (!req.query.status) query.status = { $ne: "archived" };

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({
      success: true,
      count: notifications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/v1/notifications/unread-count
router.get("/unread-count", protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user._id,
      recipientRole: req.user.role,
      status: "unread",
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/v1/notifications/read-all
router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, recipientRole: req.user.role, status: "unread" },
      { status: "read", readAt: new Date() }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/v1/notifications/:id/read
router.patch("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { status: "read", readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/v1/notifications/:id
// Soft delete (archive)
router.delete("/:id", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { status: "archived" },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, message: "Notification archived" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/v1/notifications/preferences
router.get("/preferences", protect, async (req, res) => {
  try {
    let prefs = await NotificationPreference.findOne({ userId: req.user._id, role: req.user.role });
    if (!prefs) {
      prefs = new NotificationPreference({ userId: req.user._id, role: req.user.role });
      await prefs.save();
    }
    res.json({ success: true, data: prefs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/v1/notifications/preferences
router.patch("/preferences", protect, async (req, res) => {
  try {
    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId: req.user._id, role: req.user.role },
      { $set: { preferences: req.body.preferences } },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: prefs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/v1/notifications/push/subscribe
router.post("/push/subscribe", protect, async (req, res) => {
  try {
    const { endpoint, keys, userAgent } = req.body;
    if (!endpoint || !keys) {
      return res.status(400).json({ success: false, message: "Invalid subscription data" });
    }
    
    // Check if subscription already exists
    let subscription = await PushSubscription.findOne({ endpoint });
    if (subscription) {
       subscription.userId = req.user._id;
       subscription.role = req.user.role;
       subscription.keys = keys;
       subscription.userAgent = userAgent;
       await subscription.save();
    } else {
       subscription = new PushSubscription({
         userId: req.user._id,
         role: req.user.role,
         endpoint,
         keys,
         userAgent
       });
       await subscription.save();
    }
    
    res.json({ success: true, message: "Subscribed to push notifications" });
  } catch (error) {
    console.error("Push subscribe error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/v1/notifications/push/unsubscribe
router.delete("/push/unsubscribe", protect, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
       await PushSubscription.findOneAndDelete({ endpoint, userId: req.user._id });
    } else {
       // Unsubscribe all for this user
       await PushSubscription.deleteMany({ userId: req.user._id });
    }
    res.json({ success: true, message: "Unsubscribed from push notifications" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/v1/notifications/admin (admin logs)
router.get("/admin", protect, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await Notification.countDocuments();
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({
      success: true,
      count: notifications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
