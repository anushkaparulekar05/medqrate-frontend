const express = require("express");
const router = express.Router();
const db = require("./db");

// Register
router.post("/register", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = db.saveUser(req.body);
  const userResponse = { ...newUser };
  delete userResponse.password; // Don't return password
  res.status(201).json(userResponse);
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const hashed = db.hashPassword(password);
  if (user.password !== hashed) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const userResponse = { ...user };
  delete userResponse.password;
  res.json(userResponse);
});

// Get Doctors
router.get("/doctors", (req, res) => {
  const doctors = db.getUsers().filter(u => u.role === "DOCTOR");
  res.json(doctors);
});

// Get Patients
router.get("/patients", (req, res) => {
  const patients = db.getUsers().filter(u => u.role === "PATIENT");
  res.json(patients);
});

// Get All Users
router.get("/all", (req, res) => {
  const allUsers = db.getUsers().map(u => {
    const copy = { ...u };
    delete copy.password;
    return copy;
  });
  res.json(allUsers);
});

module.exports = router;
