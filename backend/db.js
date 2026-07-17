const fs = require("fs");
const path = require("path");

const DB_PATH = process.env.NODE_ENV === "test"
  ? path.join(__dirname, "database.test.json")
  : path.join(__dirname, "database.json");

const defaultData = {
  users: [
    // Pre-populate one doctor and one patient for quick testing
    {
      id: "doc1",
      name: "John Doe",
      email: "doctor@medqrate.com",
      password: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // sha256 for empty string or password
      role: "DOCTOR",
      speciality: "Cardiologist",
      qualification: "MD, DM (Cardiology)",
      address: "Chinchwad, Pune",
      phone: "9876543210"
    },
    {
      id: "pat1",
      name: "Jane Smith",
      email: "patient@medqrate.com",
      password: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // sha256
      role: "PATIENT",
      dob: "1995-08-15",
      age: "30",
      address: "Aundh, Pune",
      phone: "9988776655"
    }
  ],
  appointments: [],
  reminders: [],
  vitals: [],
  notifications: []
};

// Simple password hashing using Node's crypto
const crypto = require("crypto");
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Update the doctor & patient passwords to SHA-256 for 'password123'
defaultData.users[0].password = hashPassword("password123");
defaultData.users[1].password = hashPassword("password123");

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDB(defaultData);
      return defaultData;
    }
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading database:", error);
    return defaultData;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

module.exports = {
  hashPassword,
  getUsers: () => readDB().users,
  saveUser: (user) => {
    const db = readDB();
    user.id = user.id || "usr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    user.password = hashPassword(user.password);
    db.users.push(user);
    writeDB(db);
    return user;
  },
  findUserByEmail: (email) => {
    return readDB().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: (id) => {
    return readDB().users.find(u => u.id === id);
  },
  getAppointments: () => readDB().appointments,
  saveAppointment: (app) => {
    const db = readDB();
    app.id = app.id || "app_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    app.status = app.status || "PENDING";
    app.createdAt = new Date().toISOString();
    db.appointments.push(app);
    writeDB(db);
    return app;
  },
  updateAppointment: (id, updates) => {
    const db = readDB();
    const index = db.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      db.appointments[index] = { ...db.appointments[index], ...updates };
      writeDB(db);
      return db.appointments[index];
    }
    return null;
  },
  getReminders: () => readDB().reminders,
  saveReminder: (reminder) => {
    const db = readDB();
    reminder.id = reminder.id || "rem_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    reminder.createdAt = new Date().toISOString();
    db.reminders.push(reminder);
    writeDB(db);
    return reminder;
  },
  updateReminder: (id, updates) => {
    const db = readDB();
    const index = db.reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      db.reminders[index] = { ...db.reminders[index], ...updates };
      writeDB(db);
      return db.reminders[index];
    }
    return null;
  },
  deleteReminder: (id) => {
    const db = readDB();
    const filtered = db.reminders.filter(r => r.id !== id);
    db.reminders = filtered;
    writeDB(db);
    return true;
  },
  getVitals: () => readDB().vitals,
  saveVitals: (vital) => {
    const db = readDB();
    vital.id = vital.id || "vit_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    vital.timestamp = new Date().toISOString();
    db.vitals.push(vital);
    writeDB(db);
    return vital;
  },
  getNotifications: () => readDB().notifications,
  saveNotification: (notif) => {
    const db = readDB();
    notif.id = notif.id || "not_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    notif.createdAt = new Date().toISOString();
    notif.read = false;
    db.notifications.push(notif);
    writeDB(db);
    return notif;
  },
  updateNotification: (id, updates) => {
    const db = readDB();
    const index = db.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      db.notifications[index] = { ...db.notifications[index], ...updates };
      writeDB(db);
      return db.notifications[index];
    }
    return null;
  }
};
