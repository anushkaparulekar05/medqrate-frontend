import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const BASE_URL = "http://localhost:8080/api";

function DoctorHome() {

  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user?.id;

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showRegisters, setShowRegisters] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= LOAD APPOINTMENTS =================
  const loadAppointments = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/appointments/doctor/${doctorId}`
      );
      setAppointments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= LOAD PATIENT COUNT =================
  const loadPatients = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/patients`);
      setPatients(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (doctorId) {
      loadAppointments();
      loadPatients();
    }
  }, [doctorId]);

  // ================= LOAD ALL USERS =================
  const handleShowRegisters = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/all`);
      setAllUsers(res.data);
      setShowRegisters(!showRegisters);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= IMAGE SELECT =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // ================= SEND PRESCRIPTION =================
  const handleSendPrescription = async () => {

    if (!preview) {
      alert("Please upload prescription image.");
      return;
    }

    try {
      setLoading(true);

      await axios.put(
        `${BASE_URL}/appointments/approve/${selectedAppointment.id}`,
        { imagePath: preview }
      );

      alert("Prescription Sent Successfully!");

      setSelectedAppointment(null);
      setPreview(null);
      loadAppointments();

    } catch (error) {
      alert("Error sending prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav
        className="navbar navbar-expand-lg px-5 py-3"
        style={{ backgroundColor: "#4B0082" }}
      >


         <img
    src="https://img.freepik.com/premium-photo/scanning-qr-code-qr-code-verification-download-page-mobile-apps_95505-425.jpg"
    alt="MedQRate Logo"
    width="45" 
    height="45"
    className="me-2"
  />
        <h4 className="fw-bold text-white">MedQRate - Doctor</h4>

        <div className="ms-auto d-flex align-items-center text-white fw-semibold">
          <span className="me-3">
            Welcome Dr. {user?.name} 👨‍⚕️
          </span>

          <button
            className="btn btn-light btn-sm rounded-pill px-4 fw-bold"
            onClick={() => {
              localStorage.removeItem("user");
              window.location = "/";
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container mt-4">

        {/* DASHBOARD BOXES */}
        <div className="row g-4 text-center">

          <div className="col-md-4">
            <div className="card shadow-sm p-4 rounded-4 border-0">
              <h5 className="text-primary">📅 Appointment Requests</h5>
              <h3 className="fw-bold">{appointments.length}</h3>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm p-4 rounded-4 border-0">
              <h5 className="text-success">👨‍👩‍👧 Total Patients</h5>
              <h3 className="fw-bold">{patients.length}</h3>
            </div>
          </div>

          {/* NEW REGISTER BOX */}
          <div className="col-md-4">
            <div className="card shadow-sm p-4 rounded-4 border-0">
              <h5 className="text-danger">📝 Total Registers</h5>
              <button
                className="btn btn-outline-primary mt-3"
                onClick={handleShowRegisters}
              >
                {showRegisters ? "Hide" : "Show"}
              </button>
            </div>
          </div>

        </div>

        {/* SHOW REGISTERED USERS */}
        {showRegisters && (
          <div className="mt-4">
            <h5 className="fw-bold mb-3">All Registered Users</h5>

            {allUsers.map((u) => (
              <div
                key={u.id}
                className="card p-3 mb-2 shadow-sm rounded-3"
              >
                <strong>{u.name}</strong> — {u.role}
              </div>
            ))}
          </div>
        )}

        {/* APPOINTMENT LIST */}
        <div className="mt-5">
          <h4 className="fw-bold mb-4">📥 Appointment Requests</h4>

          {appointments.map((app) => (
            <div
              key={app.id}
              className="card mb-3 shadow-sm rounded-4 border-0 p-4"
            >
              <h5>🧑 {app.patient?.name}</h5>
              <p><strong>Enquiry:</strong> {app.enquiry}</p>
              <p><strong>Status:</strong> {app.status}</p>

              {app.status === "PENDING" && (
                <button
                  className="btn btn-primary"
                  onClick={() => setSelectedAppointment(app)}
                >
                  Upload Prescription
                </button>
              )}

              {app.status === "APPROVED" && (
                <span className="badge bg-success fs-6">
                  Approved
                </span>
              )}
            </div>
          ))}
        </div>

        {/* UPLOAD BOX */}
        {selectedAppointment && (
          <div className="card shadow-lg p-4 rounded-4 mt-4">
            <h5 className="fw-bold mb-3">
              Send Prescription to {selectedAppointment.patient?.name}
            </h5>

            <input
              type="file"
              className="form-control mb-3"
              accept="image/*"
              onChange={handleImageChange}
            />

            {preview && (
              <div className="text-center mb-3">
                <img
                  src={preview}
                  alt="Preview"
                  style={{ maxWidth: "300px", borderRadius: "10px" }}
                />
              </div>
            )}

            <div className="d-flex gap-3">
              <button
                className="btn btn-success"
                onClick={handleSendPrescription}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Prescription"}
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setSelectedAppointment(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>

            {/* ================= QR PRESCRIPTION SECTION ================= */}
<div className="container mt-5">
  <div className="card shadow-lg p-5 rounded-4 border-0 text-center">

    <h4 className="fw-bold mb-3 text-primary">
      📲 Send QR Prescription
    </h4>

    <p className="text-muted">
      Generate digital prescription QR code and share with your patients instantly.
    </p>

    {/* Large QR Button */}
    <a
      href="https://www.qrcodebanao.com/create-qr-code"
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-success btn-lg w-100 py-4 rounded-pill fw-bold shadow"
      style={{ fontSize: "18px" }}
    >
      🚀 Generate QR Prescription Now
    </a>

  </div>
</div>


      {/* ================= FOOTER ================= */}
<footer
  className="text-white pt-5 pb-3 mt-5"
  style={{ backgroundColor: "#4B0082" }}
>
  <div className="container">
    <div className="row">

      <div className="col-md-4">
        <h5 className="fw-bold">🏥 MedQRate</h5>
        <p className="mt-3">
          Smart Healthcare Appointment & Prescription Management System.
        </p>
        <p>📍 Chinchwad, Pune, Maharashtra</p>
        <p>📧 healthcare@gmail.com</p>
        <p>📞 +91 9876543210</p>
      </div>

      <div className="col-md-4">
        <h5 className="fw-bold">⏳ Appointment Timing</h5>
        <p className="mt-3">Mon - Fri: 9AM - 6PM</p>
        <p>Saturday: 9AM - 2PM</p>
        <p>Sunday: Closed</p>
      </div>

      <div className="col-md-4">
        <h5 className="fw-bold">📊 Social Contact</h5>
        <p className="mt-3">Instagram</p>
        <p>Facebook</p>
        <p>Youtube</p>
        <p>Linkedin</p>
      </div>

    </div>

    <hr className="bg-light mt-4" />
    <p className="text-center mb-0">
      © 2026 MedQRate. All Rights Reserved.
    </p>
  </div>
</footer>

    </>
  );
}

export default DoctorHome;