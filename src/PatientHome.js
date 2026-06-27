import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const BASE_URL = "http://localhost:8080/api";

function PatientHome() {

  const user = JSON.parse(localStorage.getItem("user"));
  const patientId = user?.id;

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [enquiry, setEnquiry] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= LOAD DOCTORS =================
  useEffect(() => {
    axios.get(`${BASE_URL}/auth/doctors`)
      .then(res => setDoctors(res.data))
      .catch(err => console.log(err));
  }, []);

  // ================= LOAD PATIENT APPOINTMENTS =================
  const loadAppointments = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/appointments/patient/${patientId}`
      );
      setAppointments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (patientId) loadAppointments();
  }, [patientId]);

  // ================= BOOK APPOINTMENT =================
  const handleBookAppointment = async () => {

    if (!enquiry.trim()) {
      alert("Please enter your enquiry.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${BASE_URL}/appointments/book/${patientId}/${selectedDoctor.id}`,
        { enquiry }
      );

      alert("🎉 Appointment Submitted Successfully!");

      setSelectedDoctor(null);
      setEnquiry("");
      loadAppointments();

    } catch (error) {
      alert("Error booking appointment.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) =>
    doc.name?.toLowerCase().includes(search.toLowerCase())
  );


  return (
  

    
    <>
      {/* ================= NAVBAR ================= */}
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
        <h4 className="text-white fw-bold">MedQRate - Patient</h4>

        <div className="ms-auto d-flex align-items-center">
          <span className="text-white fw-semibold me-3">
            Hello, {user?.name}
          </span>

          <button
            className="btn btn-danger btn-sm rounded-pill"
            onClick={() => {
              localStorage.removeItem("user");
              window.location = "/";
            }}
          >
            Logout
          </button>
        </div>
      </nav>

  

      {/* ================= SEARCH ================= */}
      <div className="container mt-4">
        <input
          type="text"
          className="form-control rounded-pill p-3 shadow-sm"
          placeholder="🔍 Search Doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ================= DOCTOR LIST ================= */}
      <div className="container mt-4">
        <h4 className="fw-bold mb-4">👨‍⚕️ Doctors</h4>

        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="card mb-4 shadow-sm border-0 rounded-4 p-4"
          >
            <div className="row align-items-center">

              <div className="col-md-8">
                <h5 className="fw-bold">{doctor.name}</h5>
                <p className="mb-1">🩺 {doctor.speciality}</p>
                <p className="mb-0">📍 {doctor.address}</p>
              </div>

              <div className="col-md-4 text-end">
                <button
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  Book Appointment
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* ================= BOOK FORM ================= */}
      {selectedDoctor && (
        <div className="container mt-4">
          <div className="card shadow p-4 rounded-4">
            <h5 className="fw-bold mb-3">
              Book Appointment with {selectedDoctor.name}
            </h5>

            <textarea
              className="form-control mb-3"
              placeholder="Enter your enquiry..."
              value={enquiry}
              onChange={(e) => setEnquiry(e.target.value)}
            />

            <button
              className="btn btn-success me-2"
              onClick={handleBookAppointment}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setSelectedDoctor(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ================= MY APPOINTMENTS ================= */}
      <div className="container mt-5">
        <h4 className="fw-bold mb-4">📅 My Appointments</h4>

        {appointments.length === 0 && (
          <p className="text-muted">No appointments yet.</p>
        )}

        {appointments.map((app) => (
          <div key={app.id}
            className="card mb-3 shadow-sm border-0 rounded-4 p-3">

            <h6>Doctor: {app.doctor?.name}</h6>
            <p>Enquiry: {app.enquiry}</p>
            <p>Status: {app.status}</p>

            {app.status === "APPROVED" && app.imagePath && (
              <a
                href={app.imagePath}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-sm"
              >
                View Prescription
              </a>
            )}

            {app.status === "PENDING" && (
              <span className="badge bg-warning">Pending</span>
            )}

          </div>
        ))}
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

export default PatientHome;