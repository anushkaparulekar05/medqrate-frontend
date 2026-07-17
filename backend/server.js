const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./authRoutes");
const appointmentRoutes = require("./appointmentRoutes");
const reminderRoutes = require("./reminderRoutes");
const vitalsRoutes = require("./vitalsRoutes");
const notificationRoutes = require("./notificationRoutes");

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for frontend requests
app.use(cors());

// Configure JSON body parser with high payload limit for base64 image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/vitals", vitalsRoutes);
app.use("/api/notifications", notificationRoutes);

// Simple Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Start the server
let server;
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`🚀 MedQRate Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
