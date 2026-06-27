import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Register() {

  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role || "PATIENT";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    age: "",
    speciality: "",
    qualification: "",
    address: "",
    phone: "",
    role: role
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:8080/api/auth/register", formData);
    alert("Registered Successfully");
    navigate("/login");
  };

  return (
    <>
      <style>
        {`
          .register-wrapper {
            min-height:89vh;
                background-image: url("https://myqrcode.com/wp-content/uploads/2024/04/QR-Codes-for-Prescription-Reordering-and-Healthcare-Appointments_Main-Illustration.webp");
            background-size: cover;      
           background-position: center;  
           background-repeat: no-repeat;
            display: flex;
            align-items: center;
            justify-content: center;
            // padding: 20px;
          }

          .register-card {
            width: 500px;
            background: white;
            border-radius: 20px;
            padding: 35px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.2);
            animation: fadeIn 0.8s ease-in-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .page-title {
            font-weight: 700;
            color: #4B0082;
            margin-bottom: 20px;
          }

          .form-control {
            border-radius: 12px;
            padding: 10px 15px;
            border: 1px solid #ddd;
            transition: 0.3s;
          }

          .form-control:focus {
            box-shadow: 0 0 8px rgba(75, 0, 130, 0.3);
            border-color: #4B0082;
          }

          .register-btn {
            background: linear-gradient(135deg, #4B0082, #1e90ff);
            border: none;
            border-radius: 50px;
            padding: 10px;
            font-weight: 600;
            color: white;
            transition: 0.3s;
          }

          .register-btn:hover {
            opacity: 0.9;
          }

          @media (max-width: 576px) {
            .register-card {
              width: 100%;
            }
          }
        `}
      </style>
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

      <div className="register-wrapper">
        <div className="register-card">

          <h2 className="text-center page-title">
            {role === "DOCTOR"
              ? "🩺 Doctor Registration"
              : "👨‍👩‍👧 Patient Registration"}
          </h2>

          <form onSubmit={handleSubmit}>

            <input
              className="form-control mb-3"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />

            <input
              className="form-control mb-3"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
            />

            <input
              type="password"
              className="form-control mb-3"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            {role === "PATIENT" ? (
              <>
                <input
                  className="form-control mb-3"
                  name="dob"
                  placeholder="Date of Birth"
                  onChange={handleChange}
                />

                <input
                  className="form-control mb-3"
                  name="age"
                  placeholder="Age"
                  onChange={handleChange}
                />
              </>
            ) : (
              <>
                <input
                  className="form-control mb-3"
                  name="speciality"
                  placeholder="Speciality"
                  onChange={handleChange}
                />

                <input
                  className="form-control mb-3"
                  name="qualification"
                  placeholder="Qualification"
                  onChange={handleChange}
                />
              </>
            )}

            <input
              className="form-control mb-3"
              name="address"
              placeholder="Address"
              onChange={handleChange}
            />

            <input
              className="form-control mb-4"
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
            />

            <button className="register-btn w-100">
              Register Now
            </button>

          </form>

          <p className="text-center mt-3">
  Already have an account?{" "}
  <span
    className="register-link"
    onClick={() => navigate("/login")}
    style={{ color: "#4B0082", cursor: "pointer", fontWeight: "600" }}
  >
    Login
  </span>
</p>
        </div>
      </div>
    </>
  );
}

export default Register;