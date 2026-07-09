import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "PATIENT";

  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    dob: "", age: "", speciality: "",
    qualification: "", address: "", phone: "", role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, formData);
      alert("✅ Registered Successfully! Please login.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || "Registration failed. Please try again.";
      setError(typeof msg === "string" ? msg : "Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .reg-wrapper {
          min-height: 89vh;
          background-image: url("https://myqrcode.com/wp-content/uploads/2024/04/QR-Codes-for-Prescription-Reordering-and-Healthcare-Appointments_Main-Illustration.webp");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .reg-card {
          width: 100%;
          max-width: 480px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: clamp(20px, 5vw, 36px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          animation: fadeUp 0.6s ease;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .reg-title { font-weight:800; color:#4B0082; font-size:clamp(18px,5vw,24px); margin-bottom:18px; text-align:center; }
        .reg-input {
          width:100%; border-radius:12px; padding:11px 15px;
          border:1.5px solid #ddd; font-size:15px;
          transition:0.3s; margin-bottom:12px; outline:none; box-sizing:border-box;
        }
        .reg-input:focus { border-color:#4B0082; box-shadow:0 0 8px rgba(75,0,130,0.2); }
        .reg-btn {
          width:100%; background:linear-gradient(135deg,#4B0082,#1e90ff);
          border:none; border-radius:50px; padding:13px;
          font-weight:700; font-size:16px; color:white;
          cursor:pointer; transition:0.3s; margin-top:4px;
        }
        .reg-btn:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); }
        .reg-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .reg-navbar { background:linear-gradient(135deg,#4B0082,#2c0060); padding:12px 20px; display:flex; align-items:center; justify-content:space-between; }
        .reg-navbar img { width:40px; height:40px; border-radius:10px; object-fit:cover; }
        .reg-navbar h3 { color:white; font-weight:800; margin:0; font-size:clamp(16px,4vw,22px); }
        .reg-navbar button { background:white; color:#4B0082; border:none; border-radius:50px; padding:7px 18px; font-weight:700; font-size:13px; cursor:pointer; }
        .error-box { background:#fff0f0; border:1.5px solid #ffcccc; color:#cc0000; border-radius:10px; padding:10px 14px; margin-bottom:12px; font-size:14px; }
        .divider { display:flex; align-items:center; gap:10px; margin:12px 0; }
        .divider hr { flex:1; border-color:#eee; }
        .divider span { color:#999; font-size:13px; white-space:nowrap; }
        .login-link { text-align:center; margin-top:14px; font-size:14px; }
        .login-link span { color:#4B0082; font-weight:700; cursor:pointer; text-decoration:underline; }
      `}</style>

      {/* NAVBAR */}
      <nav className="reg-navbar">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img src="https://img.freepik.com/premium-photo/scanning-qr-code-qr-code-verification-download-page-mobile-apps_95505-425.jpg" alt="logo" />
          <h3>MedQRate</h3>
        </div>
        <button onClick={() => navigate("/login")}>Login</button>
      </nav>

      <div className="reg-wrapper">
        <div className="reg-card">
          <p className="reg-title">
            {role === "DOCTOR" ? "🩺 Doctor Registration" : "👤 Patient Registration"}
          </p>

          {error && <div className="error-box">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <input className="reg-input" name="name" placeholder="Full Name" onChange={handleChange} required />
            <input className="reg-input" type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
            <input className="reg-input" type="password" name="password" placeholder="Password (min 6 chars)" onChange={handleChange} required minLength={6} />

            {role === "PATIENT" ? (
              <>
                <input className="reg-input" name="dob" type="date" placeholder="Date of Birth" onChange={handleChange} />
                <input className="reg-input" type="number" name="age" placeholder="Age" onChange={handleChange} />
              </>
            ) : (
              <>
                <input className="reg-input" name="speciality" placeholder="Speciality (e.g. Cardiologist)" onChange={handleChange} />
                <input className="reg-input" name="qualification" placeholder="Qualification (e.g. MBBS, MD)" onChange={handleChange} />
              </>
            )}

            <input className="reg-input" name="address" placeholder="Address" onChange={handleChange} />
            <input className="reg-input" name="phone" placeholder="Phone Number" onChange={handleChange} />

            <button className="reg-btn" type="submit" disabled={loading}>
              {loading ? "⏳ Registering..." : "✅ Register Now"}
            </button>
          </form>

          <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login here</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;