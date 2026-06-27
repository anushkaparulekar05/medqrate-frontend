import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/login",
        { email, password }
      );

      localStorage.setItem("user", JSON.stringify(res.data));

      if (res.data.role === "PATIENT") {
        navigate("/patient-home");
      } else {
        navigate("/doctor-home");
      }

    } catch (error) {
      alert("Invalid Credentials");
    }
  };

  


  return (
    <>
      <style>
        {`
          .login-wrapper {
            min-height: 90vh;

            background-image: url("https://myqrcode.com/wp-content/uploads/2024/04/QR-Codes-for-Prescription-Reordering-and-Healthcare-Appointments_Main-Illustration.webp");
            background-size: cover;      
           background-position: center;  
           background-repeat: no-repeat;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .login-card {
            width: 450px;
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

          .login-btn {
            background: linear-gradient(135deg, #4B0082, #1e90ff);
            border: none;
            border-radius: 50px;
            padding: 10px;
            font-weight: 600;
            color: white;
            transition: 0.3s;
          }

          .login-btn:hover {
            opacity: 0.9;
          }

          .register-link {
            color: #4B0082;
            cursor: pointer;
            font-weight: 600;
          }

          @media (max-width: 576px) {
            .login-card {
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
      

      <div className="login-wrapper">
        <div className="login-card">

          <h2 className="text-center page-title">
            🔐 Welcome Back
          </h2>

          <form onSubmit={handleLogin}>

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Email Address"
              onChange={e => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              className="form-control mb-4"
              placeholder="Password"
              onChange={e => setPassword(e.target.value)}
              required
            />

            <button className="login-btn w-100">
              Login
            </button>

          </form>

          <p className="text-center mt-3">
            Don't have an account?{" "}
            <span
              className="register-link"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>

        </div>
      </div>
    </>
  );
}

export default Login;