const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../server");

const TEST_DB_PATH = path.join(__dirname, "../database.test.json");

describe("MediQRate Backend API Integration Tests", () => {
  // Ensure we start with a clean test database
  beforeEach(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      try {
        fs.unlinkSync(TEST_DB_PATH);
      } catch (err) {
        // Ignore files in use or missing
      }
    }
  });

  afterAll(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      try {
        fs.unlinkSync(TEST_DB_PATH);
      } catch (err) {
        // Ignore
      }
    }
  });

  describe("Authentication API (/api/auth)", () => {
    it("should login pre-populated doctor", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "doctor@medqrate.com",
          password: "password123"
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("role", "DOCTOR");
      expect(res.body).toHaveProperty("email", "doctor@medqrate.com");
      expect(res.body).not.toHaveProperty("password");
    });

    it("should login pre-populated patient", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "patient@medqrate.com",
          password: "password123"
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("role", "PATIENT");
      expect(res.body).toHaveProperty("email", "patient@medqrate.com");
    });

    it("should reject login with wrong credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "patient@medqrate.com",
          password: "wrongpassword"
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });

    it("should register a new patient", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Alice Cooper",
          email: "alice@example.com",
          password: "alicepassword",
          role: "PATIENT",
          dob: "1990-01-01",
          age: "36",
          address: "Seattle, WA",
          phone: "1234567890"
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("email", "alice@example.com");
      expect(res.body).toHaveProperty("id");
      expect(res.body).not.toHaveProperty("password");
    });

    it("should reject registering duplicate emails", async () => {
      // First registration
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Alice Cooper",
          email: "alice@example.com",
          password: "alicepassword",
          role: "PATIENT"
        });

      // Duplicate registration
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Alice 2",
          email: "alice@example.com",
          password: "somepassword",
          role: "PATIENT"
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "User already exists");
    });

    it("should fetch lists of doctors and patients separately", async () => {
      const doctorsRes = await request(app).get("/api/auth/doctors");
      expect(doctorsRes.status).toBe(200);
      expect(Array.isArray(doctorsRes.body)).toBe(true);
      expect(doctorsRes.body.some(u => u.role === "PATIENT")).toBe(false);

      const patientsRes = await request(app).get("/api/auth/patients");
      expect(patientsRes.status).toBe(200);
      expect(Array.isArray(patientsRes.body)).toBe(true);
      expect(patientsRes.body.some(u => u.role === "DOCTOR")).toBe(false);
    });
  });

  describe("Appointments API (/api/appointments)", () => {
    it("should book an appointment and verify notifications", async () => {
      // Book app between patient pat1 and doctor doc1
      const res = await request(app)
        .post("/api/appointments/book/pat1/doc1")
        .send({ enquiry: "Persistent cough" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("status", "PENDING");
      expect(res.body).toHaveProperty("enquiry", "Persistent cough");
      expect(res.body.patient).toHaveProperty("id", "pat1");
      expect(res.body.doctor).toHaveProperty("id", "doc1");

      const appId = res.body.id;

      // Check single appointment details
      const singleRes = await request(app).get(`/api/appointments/${appId}`);
      expect(singleRes.status).toBe(200);
      expect(singleRes.body.enquiry).toBe("Persistent cough");

      // Verify that notification is created for doctor
      const notifsRes = await request(app).get("/api/notifications/user/doc1");
      expect(notifsRes.status).toBe(200);
      expect(notifsRes.body.length).toBeGreaterThan(0);
      expect(notifsRes.body[0].type).toBe("APPOINTMENT_REQUEST");
    });

    it("should allow doctor to approve appointment with prescription", async () => {
      // 1. Book appointment
      const bookRes = await request(app)
        .post("/api/appointments/book/pat1/doc1")
        .send({ enquiry: "Sore Throat" });
      const appId = bookRes.body.id;

      // 2. Approve with prescription
      const approveRes = await request(app)
        .put(`/api/appointments/approve/${appId}`)
        .send({
          prescription: {
            medicines: [
              {
                name: "Amoxicillin",
                dosage: "500mg",
                frequency: "Three times daily",
                duration: "7 Days",
                instructions: "Take with food"
              }
            ],
            notes: "Drink warm fluids."
          }
        });

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.status).toBe("APPROVED");
      expect(approveRes.body).toHaveProperty("approvedAt");
      expect(approveRes.body.prescription.medicines[0].name).toBe("Amoxicillin");

      // 3. Verify notification is created for the patient
      const notifsRes = await request(app).get("/api/notifications/user/pat1");
      expect(notifsRes.body.some(n => n.type === "APPOINTMENT_APPROVED")).toBe(true);
    });
  });

  describe("Reminders API (/api/reminders)", () => {
    it("should create, list, toggle, and delete medicine reminders", async () => {
      // Create reminder
      const createRes = await request(app)
        .post("/api/reminders/patient/pat1")
        .send({
          name: "Vitamin C",
          dosage: "1 tablet",
          timing: ["Morning"],
          frequency: "Daily",
          startDate: "2026-06-29",
          endDate: "2026-07-29"
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body).toHaveProperty("name", "Vitamin C");
      const remId = createRes.body.id;

      // List reminders
      const listRes = await request(app).get("/api/reminders/patient/pat1");
      expect(listRes.status).toBe(200);
      expect(listRes.body.length).toBeGreaterThan(0);
      expect(listRes.body[0].name).toBe("Vitamin C");

      // Toggle Taken
      const toggleRes = await request(app)
        .put(`/api/reminders/toggle/${remId}`)
        .send({
          date: "2026-06-29",
          status: "TAKEN"
        });
      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.logs["2026-06-29"]).toBe("TAKEN");

      // Delete reminder
      const deleteRes = await request(app).delete(`/api/reminders/${remId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body).toHaveProperty("message", "Reminder deleted successfully");

      // Confirm deleted
      const postDeleteList = await request(app).get("/api/reminders/patient/pat1");
      expect(postDeleteList.body.some(r => r.id === remId)).toBe(false);
    });
  });

  describe("Vitals API (/api/vitals)", () => {
    it("should log patient vitals and check health alerts", async () => {
      // Log normal vitals
      const normalRes = await request(app)
        .post("/api/vitals/patient/pat1")
        .send({
          systolic: 120,
          diastolic: 80,
          heartRate: 72,
          bloodSugar: 90,
          weight: 70
        });

      expect(normalRes.status).toBe(201);
      expect(normalRes.body.systolic).toBe(120);

      // Verify no critical alert notification created for normal
      const normalNotifs = await request(app).get("/api/notifications/user/pat1");
      const vitalsWarnings = normalNotifs.body.filter(n => n.type === "VITALS_WARNING");
      expect(vitalsWarnings.length).toBe(0);

      // Log abnormal vitals
      const abnormalRes = await request(app)
        .post("/api/vitals/patient/pat1")
        .send({
          systolic: 150, // high BP
          diastolic: 95,  // high BP
          heartRate: 110, // high HR
          bloodSugar: 200, // high blood sugar
          weight: 70
        });

      expect(abnormalRes.status).toBe(201);

      // Verify alert notification is created for abnormal
      const alertNotifs = await request(app).get("/api/notifications/user/pat1");
      const warningsAfter = alertNotifs.body.filter(n => n.type === "VITALS_WARNING");
      expect(warningsAfter.length).toBeGreaterThan(0);
      expect(warningsAfter[0].message).toContain("High Blood Pressure");
      expect(warningsAfter[0].message).toContain("High Heart Rate");
      expect(warningsAfter[0].message).toContain("High Blood Sugar");
    });
  });

  describe("Notifications API (/api/notifications)", () => {
    it("should fetch and mark notifications as read", async () => {
      // Send appointment request to generate a notification
      await request(app)
        .post("/api/appointments/book/pat1/doc1")
        .send({ enquiry: "Back pain" });

      const notifsRes = await request(app).get("/api/notifications/user/doc1");
      expect(notifsRes.status).toBe(200);
      const unreadNotif = notifsRes.body.find(n => !n.read);
      expect(unreadNotif).toBeDefined();

      const notifId = unreadNotif.id;

      // Mark read
      const readRes = await request(app).put(`/api/notifications/read/${notifId}`);
      expect(readRes.status).toBe(200);
      expect(readRes.body.read).toBe(true);
    });
  });
});
