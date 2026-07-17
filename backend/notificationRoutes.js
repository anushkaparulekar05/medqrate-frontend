const express = require("express");
const router = express.Router();
const db = require("./db");

// Get notifications for a User
router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;
  const notifs = db.getNotifications()
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(notifs);
});

// Mark notification as Read
router.put("/read/:notificationId", (req, res) => {
  const { notificationId } = req.params;
  const updated = db.updateNotification(notificationId, { read: true });
  if (!updated) {
    return res.status(404).json({ message: "Notification not found" });
  }
  res.json(updated);
});

module.exports = router;
