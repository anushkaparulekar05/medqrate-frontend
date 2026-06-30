import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        /* ── MOBILE-FIRST STYLES ── */
        .land-navbar {
          background: linear-gradient(135deg,#4B0082,#2c0060);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 20px rgba(75,0,130,0.4);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .land-logo { display:flex; align-items:center; gap:10px; }
        .land-logo img { width:40px; height:40px; border-radius:10px; object-fit:cover; }
        .land-logo h3 { color:white; font-weight:800; margin:0; font-size:clamp(16px,4vw,22px); }
        .nav-btns { display:flex; gap:8px; }
        .btn-login  { background:rgba(255,255,255,0.15); color:white; border:1.5px solid rgba(255,255,255,0.5); border-radius:50px; padding:7px 18px; font-weight:600; font-size:13px; cursor:pointer; transition:0.2s; }
        .btn-login:hover { background:rgba(255,255,255,0.3); }
        .btn-start  { background:white; color:#4B0082; border:none; border-radius:50px; padding:7px 18px; font-weight:700; font-size:13px; cursor:pointer; transition:0.2s; }
        .btn-start:hover { background:#f0e0ff; }

        /* ── HERO ── */
        .hero-section {
          min-height: 88vh;
          background-image: url("https://myqrcode.com/wp-content/uploads/2024/04/QR-Codes-for-Prescription-Reordering-and-Healthcare-Appointments_Main-Illustration.webp");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .hero-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: clamp(24px,5vw,48px);
          max-width: 600px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          animation: fadeUp 0.6s ease;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .hero-icon { width:70px; height:70px; background:linear-gradient(135deg,#4B0082,#1e90ff); border-radius:50%; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; font-size:30px; }
        .hero-title { font-size:clamp(22px,5vw,38px); font-weight:800; color:#1a0033; margin-bottom:12px; }
        .hero-title span { color:#4B0082; }
        .hero-sub { font-size:clamp(14px,3vw,17px); color:#555; margin-bottom:28px; line-height:1.6; }
        .hero-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
        .hero-btn-doc { background:linear-gradient(135deg,#4B0082,#1e90ff); color:white; border:none; border-radius:50px; padding:12px 26px; font-weight:700; font-size:clamp(13px,3vw,15px); cursor:pointer; transition:0.2s; }
        .hero-btn-doc:hover { opacity:0.9; transform:translateY(-2px); }
        .hero-btn-pat { background:white; color:#4B0082; border:2px solid #4B0082; border-radius:50px; padding:12px 26px; font-weight:700; font-size:clamp(13px,3vw,15px); cursor:pointer; transition:0.2s; }
        .hero-btn-pat:hover { background:#f0e0ff; transform:translateY(-2px); }

        /* already have account */
        .already { margin-top:20px; font-size:14px; color:#555; }
        .already span { color:#4B0082; font-weight:700; cursor:pointer; text-decoration:underline; }

        /* ── FEATURES ── */
        .features-section { background:#f8f0ff; padding:60px 20px; }
        .feat-card { background:white; border-radius:18px; padding:24px; box-shadow:0 4px 18px rgba(75,0,130,0.08); transition:transform 0.2s; height:100%; }
        .feat-card:hover { transform:translateY(-4px); }
        .feat-icon { font-size:36px; margin-bottom:12px; }

        /* ── CTA ── */
        .cta-section { background:linear-gradient(135deg,#4B0082,#1e90ff); padding:60px 20px; text-align:center; color:white; }

        /* ── FOOTER ── */
        .land-footer { background:linear-gradient(135deg,#2c0060,#4B0082); color:white; padding:40px 20px 20px; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="land-navbar">
        <div className="land-logo">
          <img src="https://img.freepik.com/premium-photo/scanning-qr-code-qr-code-verification-download-page-mobile-apps_95505-425.jpg" alt="logo" />
          <h3>MedQRate</h3>
        </div>
        <div className="nav-btns">
          <button className="btn-login" onClick={() => navigate("/login")}>Login</button>
          <button className="btn-start" onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-card">
          <div className="hero-icon">🏥</div>
          <h1 className="hero-title">
            Smart Healthcare Through <span>Innovation</span>
          </h1>
          <p className="hero-sub">
            Connect doctors and patients seamlessly. Manage prescriptions,
            book appointments, and never miss your medication schedule.
          </p>
          <div className="hero-btns">
            <button className="hero-btn-doc" onClick={() => navigate("/register", { state: { role: "DOCTOR" } })}>
              🩺 I'm a Doctor
            </button>
            <button className="hero-btn-pat" onClick={() => navigate("/register", { state: { role: "PATIENT" } })}>
              👤 I'm a Patient
            </button>
          </div>
          <p className="already">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login here</span>
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color:"#4B0082" }}>✨ Everything You Need</h2>
            <p className="text-muted">Modern digital solutions for doctors and patients.</p>
          </div>
          <div className="row g-4">
            {[
              { icon:"📄", title:"Digital Prescriptions", desc:"Generate and share secure QR prescriptions instantly." },
              { icon:"⏰", title:"Smart Reminders", desc:"Never miss a dose with alarm-based medicine reminders." },
              { icon:"📅", title:"Easy Appointments", desc:"Book nearby doctors in seconds, anytime." },
              { icon:"📊", title:"Doctor Dashboard", desc:"Manage patients and approve appointments efficiently." },
              { icon:"📱", title:"Patient Portal", desc:"Access your prescriptions and health data anytime." },
              { icon:"🔒", title:"Secure & Private", desc:"Your medical data is protected and private." },
            ].map((item, i) => (
              <div className="col-md-4 col-sm-6" key={i}>
                <div className="feat-card">
                  <div className="feat-icon">{item.icon}</div>
                  <h5 className="fw-bold" style={{ color:"#4B0082" }}>{item.title}</h5>
                  <p className="text-muted mt-2" style={{ fontSize:14 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <h2 className="fw-bold">🚀 Ready to Transform Healthcare?</h2>
          <p className="mt-3 mb-4">Join doctors and patients already using MedQRate.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="hero-btn-doc" style={{ fontSize:16, padding:"13px 30px" }} onClick={() => navigate("/register")}>
              Get Started Free
            </button>
            <button className="btn-login" style={{ fontSize:16, padding:"13px 30px" }} onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="land-footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="fw-bold">🏥 MedQRate</h5>
              <p className="mt-2" style={{ opacity:0.8, fontSize:14 }}>Smart Healthcare Appointment & Prescription Management.</p>
              <p style={{ fontSize:13 }}>📍 Chinchwad, Pune, Maharashtra</p>
              <p style={{ fontSize:13 }}>📧 healthcare@gmail.com</p>
              <p style={{ fontSize:13 }}>📞 +91 9876543210</p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold">⏳ Timings</h5>
              <p className="mt-2" style={{ fontSize:13 }}>Mon – Fri: 9AM – 6PM</p>
              <p style={{ fontSize:13 }}>Saturday: 9AM – 2PM</p>
              <p style={{ fontSize:13 }}>Sunday: Closed</p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold">🔗 Quick Links</h5>
              <p className="mt-2" style={{ cursor:"pointer", fontSize:13 }} onClick={() => navigate("/login")}>🔐 Login</p>
              <p style={{ cursor:"pointer", fontSize:13 }} onClick={() => navigate("/register", { state:{ role:"DOCTOR" } })}>🩺 Register as Doctor</p>
              <p style={{ cursor:"pointer", fontSize:13 }} onClick={() => navigate("/register", { state:{ role:"PATIENT" } })}>👤 Register as Patient</p>
            </div>
          </div>
          <hr style={{ opacity:0.3, marginTop:30 }} />
          <p className="text-center mb-0" style={{ opacity:0.7, fontSize:13 }}>© 2026 MedQRate. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default LandingPage;
