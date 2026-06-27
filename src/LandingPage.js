import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function LandingPage() {

  const navigate = useNavigate();

  return (
    <>
      {/* ================= NAVBAR (Dark Purple) ================= */}
      <nav
        className="navbar navbar-expand-lg px-5 py-3"
        style={{ backgroundColor: "#4B0082" }}
      >
        <div className="d-flex align-items-center">
  <img
    src="https://img.freepik.com/premium-photo/scanning-qr-code-qr-code-verification-download-page-mobile-apps_95505-425.jpg"
    alt="MedQRate Logo"
    width="45" 
    height="45"
    className="me-2"
  />
        <h3 className="fw-bold text-white">MedQRate</h3>
       </div>
        <div className="ms-auto">
          <button
            className="btn btn-light px-4 rounded-pill fw-semibold"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>
      </nav>
           
      {/* ================= HERO SECTION (Blue Background) ================= */}
      <section
        className="text-center text-white d-flex align-items-center justify-content-center"
        style={{
          height: "89vh",
              backgroundImage:
      'url("https://myqrcode.com/wp-content/uploads/2024/04/QR-Codes-for-Prescription-Reordering-and-Healthcare-Appointments_Main-Illustration.webp")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
          // background: "linear-gradient(135deg, #1e90ff, #0056d2)"
        }}
      >
        <div className="container">

          <div className="mb-4">
            <div
              style={{
                width: "75px",
                height: "75px",
                backgroundColor: "white",
                borderRadius: "50%",
                margin: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1e90ff",
                fontSize: "26px",
                fontWeight: "bold"
              }}
            >
              🏥
            </div>
          </div>
          
          <h1 className="display-5 fw-bold  text-dark">
             Smart Healthcare Through <span className="text-warning">Innovation</span>
          </h1>

          <p className="lead mt-4  text-dark">
            Connect doctors and patients seamlessly. Manage prescriptions,
            book appointments, and never miss your medication schedule.
          </p>

          <div className="mt-4">
            <button
  className="btn btn-light btn-lg px-4 me-3 rounded-pill fw-semibold"
  onClick={() => navigate("/register", { state: { role: "DOCTOR" } })}
>
  🩺 I'm a Doctor
</button>

            <button
  className="btn btn-outline-light btn-lg px-4 rounded-pill fw-semibold"
  onClick={() => navigate("/register", { state: { role: "PATIENT" } })}
>
  👨‍👩‍👧 I'm a Patient
</button>
          </div>

        </div>
      </section>

      {/* ================= FEATURES SECTION (Light Pink Background) ================= */}
      <section
        className="py-5"
        style={{ backgroundColor: "#ffe6f2" }}
      >
        <div className="container">

          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">
              ✨ Everything You Need for Better Healthcare
            </h2>
            <p className="text-muted">
              Modern digital solutions designed for doctors and patients.
            </p>
          </div>

          <div className="row g-4">

            {[
              { icon: "📄", title: "Digital Prescriptions", desc: "Generate and share secure prescriptions instantly." },
              { icon: "⏰", title: "Smart Reminders", desc: "Automated medicine and appointment alerts." },
              { icon: "📅", title: "Easy Appointments", desc: "Book nearby doctors in seconds." },
              { icon: "📊", title: "Doctor Dashboard", desc: "Manage patients and track records efficiently." },
              { icon: "📱", title: "Patient Portal", desc: "Access prescriptions and health data anytime." },
              { icon: "🔒", title: "Secure & Private", desc: "Your medical data is encrypted and protected." }
            ].map((item, index) => (
              <div className="col-md-4" key={index}>
                <div className="card border-0 shadow-sm h-100 p-4 rounded-4 text-center">
                  <h5 className="fw-bold text-primary">
                    {item.icon} {item.title}
                  </h5>
                  <p className="text-muted mt-3">{item.desc}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section
        className="text-white text-center py-5"
        style={{
          background: "linear-gradient(135deg, #0056d2, #1e90ff)"
        }}
      >
        <div className="container">
          <h2 className="fw-bold">
            🚀 Ready to Transform Your Healthcare Experience?
          </h2>

          <p className="mt-3">
            Join thousands of doctors and patients already using MedQRate.
          </p>

          <button
            className="btn btn-light btn-lg mt-3 rounded-pill px-4 fw-semibold"
            onClick={() => navigate("/register")}
          >
            Get Started Now
          </button>
        </div>
      </section>

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

export default LandingPage;


