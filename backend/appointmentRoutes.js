const express = require("express");
const router = express.Router();
const db = require("./db");

// Book Appointment
router.post("/book/:patientId/:doctorId", (req, res) => {
  const { patientId, doctorId } = req.params;
  const { enquiry } = req.body;

  const patient = db.findUserById(patientId);
  const doctor = db.findUserById(doctorId);

  if (!patient || !doctor) {
    return res.status(404).json({ message: "Patient or Doctor not found" });
  }

  const app = db.saveAppointment({
    patientId,
    doctorId,
    enquiry,
    status: "PENDING",
    patient: { id: patient.id, name: patient.name, email: patient.email },
    doctor: { id: doctor.id, name: doctor.name, email: doctor.email }
  });

  // Create notification for Doctor
  db.saveNotification({
    userId: doctorId,
    title: "New Appointment Request",
    message: `${patient.name} has requested an appointment for: "${enquiry}"`,
    type: "APPOINTMENT_REQUEST",
    referenceId: app.id
  });

  res.status(201).json(app);
});

// Get appointments for a Patient
router.get("/patient/:patientId", (req, res) => {
  const { patientId } = req.params;
  const apps = db.getAppointments().filter(a => a.patientId === patientId);
  res.json(apps);
});

// Get appointments for a Doctor
router.get("/doctor/:doctorId", (req, res) => {
  const { doctorId } = req.params;
  const apps = db.getAppointments().filter(a => a.doctorId === doctorId);
  res.json(apps);
});

// Get single appointment (for public/private details)
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const app = db.getAppointments().find(a => a.id === id);
  if (!app) {
    return res.status(404).json({ message: "Appointment not found" });
  }
  res.json(app);
});

// Approve Appointment (Send Prescription)
router.put("/approve/:appointmentId", (req, res) => {
  const { appointmentId } = req.params;
  const { imagePath, prescription } = req.body;

  const existing = db.getAppointments().find(a => a.id === appointmentId);
  if (!existing) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  const updated = db.updateAppointment(appointmentId, {
    status: "APPROVED",
    imagePath: imagePath || null,
    prescription: prescription || null,
    approvedAt: new Date().toISOString()
  });

  // Create notification for Patient
  db.saveNotification({
    userId: existing.patientId,
    title: "Appointment Approved & Prescription Ready",
    message: `Dr. ${existing.doctor?.name} approved your appointment and uploaded your prescription.`,
    type: "APPOINTMENT_APPROVED",
    referenceId: appointmentId
  });

  res.json(updated);
});

module.exports = router;
