const Notification = require("../models/Notification");
const NotificationPreference = require("../models/NotificationPreference");
const PushSubscription = require("../models/PushSubscription");
const webpush = require("web-push");

// Configure web-push if keys are available
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@kaammitra.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const getCategoryFromType = (type) => {
  if (type.startsWith("booking_")) return "booking";
  if (type.startsWith("payment_") || type.startsWith("payout_")) return "payment";
  if (type.startsWith("complaint_")) return "complaint";
  if (type === "emergency_request") return "emergency";
  if (type === "chat_message") return "chat";
  return "marketing";
};

const sendPushNotification = async (userId, role, payload) => {
  try {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return false; // Silently skip if not configured
    }
    
    const subscriptions = await PushSubscription.find({ userId, role });
    if (!subscriptions || subscriptions.length === 0) return false;

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.message,
      data: { link: payload.link },
    });

    const results = await Promise.all(
      subscriptions.map(sub => 
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          pushPayload
        ).catch(err => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Subscription has expired or is no longer valid
            return PushSubscription.findByIdAndDelete(sub._id);
          }
          console.error("Web push error:", err);
        })
      )
    );
    return true;
  } catch (err) {
    console.error("Error sending push notification:", err);
    return false;
  }
};

exports.createNotification = async ({
  recipientId,
  recipientRole,
  senderId,
  senderRole,
  type,
  title,
  message,
  data,
  link,
  priority = "normal",
  channels,
  io // Optional socket instance passed from route/controller
}) => {
  try {
    // 1. Get preferences
    let prefs = await NotificationPreference.findOne({ userId: recipientId, role: recipientRole });
    if (!prefs) {
      prefs = new NotificationPreference({ userId: recipientId, role: recipientRole });
      await prefs.save();
    }

    const category = getCategoryFromType(type);
    const categoryPrefs = prefs.preferences[category] || prefs.preferences.marketing;

    // Default channels if not provided
    const resolvedChannels = channels || {
      inApp: categoryPrefs.inApp,
      push: categoryPrefs.push,
      email: categoryPrefs.email,
      sms: categoryPrefs.sms,
      whatsapp: categoryPrefs.whatsapp
    };

    // Emergency or System Alerts can override preferences
    if (priority === "urgent" || type === "system_alert" || type === "area_launch_request" || type === "worker_verification_pending") {
       resolvedChannels.inApp = true;
       resolvedChannels.push = true;
    }

    // 2. Always create in-app notification in MongoDB
    const notification = new Notification({
      recipientId,
      recipientRole,
      senderId,
      senderRole,
      type,
      title,
      message,
      data,
      link,
      priority,
      channels: resolvedChannels,
      status: "unread",
    });

    await notification.save();

    // 3. Emit real-time socket event if io is provided
    if (io && resolvedChannels.inApp) {
      this.sendRealtimeNotification(io, notification);
    }

    // 4. Send Push Notification if enabled
    if (resolvedChannels.push) {
      const pushSent = await sendPushNotification(recipientId, recipientRole, {
        title, message, link
      });
      if (pushSent) {
        notification.deliveryStatus.push = "sent";
      } else {
        notification.deliveryStatus.push = "failed";
      }
      await notification.save();
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    // Don't throw, let business logic continue even if notification fails
    return null;
  }
};

exports.sendRealtimeNotification = (io, notification) => {
  try {
    const room = `${notification.recipientRole}:${notification.recipientId}`;
    io.to(room).emit("notification:new", notification);
  } catch (error) {
    console.error("Error sending realtime notification:", error);
  }
};

exports.createBulkNotifications = async (recipients, notificationData, io) => {
  try {
    const promises = recipients.map(recipient => 
      this.createNotification({
        ...notificationData,
        recipientId: recipient.id,
        recipientRole: recipient.role,
        io
      })
    );
    await Promise.all(promises);
  } catch (error) {
    console.error("Error in createBulkNotifications:", error);
  }
};

exports.markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId, status: "unread" },
    { status: "read", readAt: new Date() },
    { new: true }
  );
};

exports.markAllAsRead = async (userId, role) => {
  return await Notification.updateMany(
    { recipientId: userId, recipientRole: role, status: "unread" },
    { status: "read", readAt: new Date() }
  );
};

exports.getUnreadCount = async (userId, role) => {
  return await Notification.countDocuments({
    recipientId: userId,
    recipientRole: role,
    status: "unread"
  });
};
