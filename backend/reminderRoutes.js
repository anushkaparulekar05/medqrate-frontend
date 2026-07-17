const express = require("express");
const router = express.Router();
const db = require("./db");

// Get reminders for a Patient
router.get("/patient/:patientId", (req, res) => {
  const { patientId } = req.params;
  const reminders = db.getReminders().filter(r => r.patientId === patientId);
  res.json(reminders);
});

// Create medicine reminder
router.post("/patient/:patientId", (req, res) => {
  const { patientId } = req.params;
  const { name, dosage, timing, frequency, startDate, endDate } = req.body;

  if (!name || !dosage || !timing) {
    return res.status(400).json({ message: "Name, dosage, and timing are required" });
  }

  const reminder = db.saveReminder({
    patientId,
    name,
    dosage,
    timing, // e.g. ["Morning", "Afternoon", "Night"]
    frequency: frequency || "Daily",
    startDate: startDate || new Date().toISOString().split("T")[0],
    endDate: endDate || null,
    logs: {} // e.g. { "2026-06-28": "TAKEN" }
  });

  res.status(201).json(reminder);
});

// Toggle Taken Log for Today
router.put("/toggle/:reminderId", (req, res) => {
  const { reminderId } = req.params;
  const { date, status } = req.body; // date is formatted "YYYY-MM-DD", status is "TAKEN" or "MISSED" or "PENDING"

  const logDate = date || new Date().toISOString().split("T")[0];

  const reminder = db.getReminders().find(r => r.id === reminderId);
  if (!reminder) {
    return res.status(404).json({ message: "Reminder not found" });
  }

  const newLogs = { ...reminder.logs };
  if (status === "PENDING") {
    delete newLogs[logDate];
  } else {
    newLogs[logDate] = status;
  }

  const updated = db.updateReminder(reminderId, { logs: newLogs });
  res.json(updated);
});

// Delete reminder
router.delete("/:reminderId", (req, res) => {
  const { reminderId } = req.params;
  db.deleteReminder(reminderId);
  res.json({ message: "Reminder deleted successfully" });
});

module.exports = router;
