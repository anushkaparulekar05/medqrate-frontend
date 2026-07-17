const express = require("express");
const router = express.Router();
const db = require("./db");

// Get vitals for a Patient
router.get("/patient/:patientId", (req, res) => {
  const { patientId } = req.params;
  const vitals = db.getVitals().filter(v => v.patientId === patientId);
  res.json(vitals);
});

// Log new vitals
router.post("/patient/:patientId", (req, res) => {
  const { patientId } = req.params;
  const { systolic, diastolic, heartRate, bloodSugar, weight } = req.body;

  const vital = db.saveVitals({
    patientId,
    systolic: Number(systolic),
    diastolic: Number(diastolic),
    heartRate: Number(heartRate),
    bloodSugar: Number(bloodSugar),
    weight: Number(weight)
  });

  // Basic threshold alert check:
  // BP high: Systolic > 140 or Diastolic > 90
  // HR high/low: HR > 100 or HR < 55
  // Sugar high/low: sugar > 140 (postprandial/random) or sugar < 70
  let warnings = [];
  if (systolic > 140 || diastolic > 90) warnings.push("High Blood Pressure");
  if (systolic < 90 || diastolic < 60) warnings.push("Low Blood Pressure");
  if (heartRate > 100) warnings.push("High Heart Rate");
  if (heartRate < 55) warnings.push("Low Heart Rate");
  if (bloodSugar > 180) warnings.push("High Blood Sugar");
  if (bloodSugar < 70) warnings.push("Low Blood Sugar");

  if (warnings.length > 0) {
    db.saveNotification({
      userId: patientId,
      title: "⚠️ Health Vitals Alert",
      message: `Your logged vitals show abnormal levels: ${warnings.join(", ")}. Please rest or consult Dr. if symptoms persist.`,
      type: "VITALS_WARNING",
      referenceId: vital.id
    });
  }

  res.status(201).json(vital);
});

module.exports = router;
