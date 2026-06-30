import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import "bootstrap/dist/css/bootstrap.min.css";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

function DoctorHome() {
  const user      = JSON.parse(localStorage.getItem("user"));
  const doctorId  = user?.id;
  const qrRef     = useRef(null);

  const [appointments, setAppointments] = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [allUsers,     setAllUsers]     = useState([]);
  const [showRegisters,setShowRegisters]= useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [copied,       setCopied]       = useState(false);

  // QR prescription state
  const emptyRx = { patientName:"", medicine:"", dosage:"", frequency:"", duration:"", instructions:"", doctorName: user?.name||"" };
  const [rxForm,      setRxForm]      = useState(emptyRx);
  const [qrValue,     setQrValue]     = useState("");
  const [showQrForm,  setShowQrForm]  = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  // ── Load data ──
  const loadAppointments = async () => {
    try { const r = await axios.get(`${BASE_URL}/appointments/doctor/${doctorId}`); setAppointments(r.data); }
    catch(e) { console.log(e); }
  };
  const loadPatients = async () => {
    try { const r = await axios.get(`${BASE_URL}/auth/patients`); setPatients(r.data); }
    catch(e) { console.log(e); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (doctorId) { loadAppointments(); loadPatients(); } }, [doctorId]);

  const handleShowRegisters = async () => {
    try { const r = await axios.get(`${BASE_URL}/auth/all`); setAllUsers(r.data); setShowRegisters(!showRegisters); }
    catch(e) { console.log(e); }
  };

  // ── Upload prescription image ──
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSendPrescription = async () => {
    if (!preview) { alert("Please upload prescription image."); return; }
    try {
      setLoading(true);
      await axios.put(`${BASE_URL}/appointments/approve/${selectedAppt.id}`, { imagePath: preview });
      alert("✅ Prescription sent successfully!");
      setSelectedAppt(null); setPreview(null); loadAppointments();
    } catch { alert("Error sending prescription"); }
    finally { setLoading(false); }
  };

  // ── Generate QR data ──
  const handleGenerateQR = () => {
    if (!rxForm.medicine.trim()) { alert("Please enter medicine name."); return; }
    const date = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
    const data = [
      "MedQRate Prescription",
      "-------------------",
      `Patient: ${rxForm.patientName}`,
      `Doctor: Dr. ${rxForm.doctorName}`,
      `Medicine: ${rxForm.medicine}`,
      `Dosage: ${rxForm.dosage}`,
      `Frequency: ${rxForm.frequency}`,
      `Duration: ${rxForm.duration}`,
      `Instructions: ${rxForm.instructions}`,
      `Date: ${date}`,
    ].join("\n");
    setQrValue(data);
    setQrGenerated(true);
  };

  // ── Download QR image ──
  const handleDownloadQR = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `prescription_${rxForm.patientName || "patient"}_${Date.now()}.png`;
    a.click();
  };

  // ── Share on WhatsApp ──
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `💊 *MedQRate Prescription*\n\nPatient: ${rxForm.patientName}\nDoctor: Dr. ${rxForm.doctorName}\nMedicine: ${rxForm.medicine}\nDosage: ${rxForm.dosage}\nFrequency: ${rxForm.frequency}\nDuration: ${rxForm.duration}\nInstructions: ${rxForm.instructions}\n\n📲 Download the QR image from the app and upload it on your Patient Dashboard to view the full prescription.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // ── Copy prescription text ──
  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        .dash-card { border-radius:18px; border:none; box-shadow:0 4px 20px rgba(0,0,0,0.07); transition:transform 0.2s; }
        .dash-card:hover { transform:translateY(-3px); }
        .appt-card { border-radius:16px; border:none; box-shadow:0 3px 14px rgba(0,0,0,0.06); border-left:5px solid #4B0082; margin-bottom:14px; }
        .qr-wrap { background:rgba(240,244,255,0.92); backdrop-filter:blur(8px); border-radius:20px; padding:28px; border:2px solid #ddd6ff; }
        .gen-btn { background:linear-gradient(135deg,#4B0082,#1e90ff); color:white; border:none; border-radius:50px; padding:10px 26px; font-weight:700; cursor:pointer; transition:opacity 0.2s; }
        .gen-btn:hover { opacity:0.88; }
        .dl-btn { background:linear-gradient(135deg,#2ecc71,#27ae60); color:white; border:none; border-radius:50px; padding:10px 22px; font-weight:700; cursor:pointer; }
        .wa-btn { background:linear-gradient(135deg,#25D366,#128C7E); color:white; border:none; border-radius:50px; padding:10px 22px; font-weight:700; cursor:pointer; }
        .qr-result { background:rgba(255,255,255,0.95); border-radius:20px; padding:26px; box-shadow:0 8px 32px rgba(75,0,130,0.13); margin-top:22px; animation:fadeUp 0.35s ease; text-align:center; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .rx-table { background:#f8f5ff; border-radius:12px; padding:14px 18px; text-align:left; margin:16px 0; font-size:13px; }
        .rx-row { display:flex; gap:8px; padding:5px 0; border-bottom:1px solid #ede8ff; }
        .rx-row:last-child { border-bottom:none; }
        .rx-lbl { font-weight:700; color:#4B0082; min-width:120px; }
        .step-badge { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:#4B0082; color:white; font-weight:700; font-size:13px; margin-right:8px; flex-shrink:0; }
        .step-row { display:flex; align-items:flex-start; padding:8px 0; font-size:14px; color:#444; }
        .upload-zone { border:2px dashed #c8b8f0; border-radius:14px; padding:24px; text-align:center; background:#faf8ff; cursor:pointer; transition:border-color 0.2s; }
        .upload-zone:hover { border-color:#4B0082; }
        .sec-card-doc { background:rgba(255,255,255,0.88); backdrop-filter:blur(8px); border-radius:18px; padding:22px; box-shadow:0 4px 18px rgba(0,0,0,0.07); margin-bottom:22px; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="navbar navbar-expand-lg px-4 px-md-5 py-3" style={{ background:"linear-gradient(135deg,#4B0082,#2c0060)", boxShadow:"0 4px 20px rgba(75,0,130,0.3)" }}>
        <div className="d-flex align-items-center">
          <span style={{ fontSize:28, marginRight:10 }}>🏥</span>
          <div>
            <h5 className="fw-bold text-white mb-0">MedQRate</h5>
            <div style={{ fontSize:11, color:"#d4b8ff" }}>Doctor Dashboard</div>
          </div>
        </div>
        <div className="ms-auto d-flex align-items-center gap-3">
          <div className="text-white text-end d-none d-md-block">
            <div className="fw-bold">Dr. {user?.name} 👨‍⚕️</div>
            <div style={{ fontSize:12, opacity:0.75 }}>General Practitioner</div>
          </div>
          <button className="btn btn-light btn-sm rounded-pill px-4 fw-bold"
            onClick={() => { localStorage.removeItem("user"); window.location = "/"; }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container py-4">

        {/* ── STATS ── */}
        <div className="row g-4 mb-4">
          {[
            { icon:"📅", label:"Appointments", val: appointments.length, color:"#1e90ff", bg:"#e8f4ff" },
            { icon:"👨‍👩‍👧", label:"Total Patients", val: patients.length,  color:"#2ecc71", bg:"#e8fff4" },
            { icon:"✅", label:"Approved",      val: appointments.filter(a=>a.status==="APPROVED").length, color:"#9b59b6", bg:"#f5f0ff" },
          ].map((s,i) => (
            <div className="col-md-4" key={i}>
              <div className="dash-card card p-4 text-center">
                <div style={{ fontSize:36, marginBottom:6 }}>{s.icon}</div>
                <h2 className="fw-bold mb-0" style={{ color:s.color }}>{s.val}</h2>
                <div className="text-muted mt-1" style={{ fontSize:14 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── ALL USERS ── */}
        <div className="mb-4">
          <button className="btn btn-outline-secondary rounded-pill" onClick={handleShowRegisters}>
            {showRegisters ? "▲ Hide Registered Users" : "▼ Show All Registered Users"}
          </button>
          {showRegisters && (
            <div className="mt-3">
              <h6 className="fw-bold mb-3">All Registered Users</h6>
              <div className="row g-2">
                {allUsers.map(u => (
                  <div className="col-md-4" key={u.id}>
                    <div className="card p-3 rounded-3 border-0 shadow-sm d-flex flex-row align-items-center gap-3">
                      <span style={{ fontSize:22 }}>{u.role === "DOCTOR" ? "🩺" : "👤"}</span>
                      <div><div className="fw-bold" style={{ fontSize:14 }}>{u.name}</div><div className="text-muted" style={{ fontSize:12 }}>{u.role}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── APPOINTMENTS ── */}
        <h4 className="fw-bold mb-3">📥 Appointment Requests</h4>
        {appointments.length === 0 && <p className="text-muted">No appointments yet.</p>}
        {appointments.map(app => (
          <div key={app.id} className="appt-card card p-4">
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
              <div>
                <h6 className="fw-bold mb-1">🧑 {app.patient?.name}</h6>
                <p className="mb-1 text-muted" style={{ fontSize:13 }}>📝 {app.enquiry}</p>
              </div>
              <div className="d-flex align-items-center gap-2">
                {app.status === "PENDING" && (
                  <button className="btn btn-primary btn-sm rounded-pill"
                    onClick={() => { setSelectedAppt(app); setPreview(null); }}>
                    📤 Send Prescription
                  </button>
                )}
                {app.status === "APPROVED" && <span className="badge bg-success px-3 py-2 rounded-pill">✅ Approved</span>}
              </div>
            </div>
          </div>
        ))}

        {/* ── UPLOAD PRESCRIPTION IMAGE ── */}
        {selectedAppt && (
          <div className="card p-4 rounded-4 border-0 shadow-lg mb-4" style={{ borderLeft:"5px solid #2ecc71" }}>
            <h5 className="fw-bold mb-3">📤 Send Prescription to <span style={{ color:"#4B0082" }}>{selectedAppt.patient?.name}</span></h5>
            <div className="upload-zone mb-3" onClick={() => document.getElementById("rxFileInput").click()}>
              {preview
                ? <img src={preview} alt="Preview" style={{ maxWidth:300, borderRadius:10 }} />
                : <><div style={{ fontSize:40 }}>🖼️</div><p className="mb-0 mt-2 fw-semibold">Click to upload prescription image</p><p className="text-muted" style={{ fontSize:12 }}>PNG, JPG supported</p></>
              }
              <input id="rxFileInput" type="file" accept="image/*" style={{ display:"none" }} onChange={handleImageChange} />
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button className="btn btn-success rounded-pill px-4" onClick={handleSendPrescription} disabled={loading}>
                {loading ? "⏳ Sending..." : "✅ Send Prescription"}
              </button>
              <button className="btn btn-outline-secondary rounded-pill" onClick={() => { setSelectedAppt(null); setPreview(null); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* ================= 📲 QR PRESCRIPTION GENERATOR ================ */}
      {/* ================================================================ */}
      <div className="container mb-5">
        <div className="qr-wrap">

          {/* Header */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
            <div>
              <h4 className="mb-0 fw-bold" style={{ color:"#4B0082" }}>📲 QR Prescription Generator</h4>
              <p className="text-muted mb-0" style={{ fontSize:13, marginTop:4 }}>
                Generate → Download QR → Send to patient via WhatsApp/Email
              </p>
            </div>
            <button className="gen-btn" onClick={() => { setShowQrForm(!showQrForm); setQrValue(""); setQrGenerated(false); }}>
              {showQrForm ? "✕ Close" : "+ Create Prescription QR"}
            </button>
          </div>

          {/* How it works */}
          {!showQrForm && !qrGenerated && (
            <div style={{ background:"white", borderRadius:14, padding:"18px 22px" }}>
              <p className="fw-bold mb-3" style={{ color:"#4B0082" }}>📋 How it works:</p>
              {[
                ["1","Fill the prescription form below"],
                ["2","Click Generate QR Code"],
                ["3","Download the QR image to your device"],
                ["4","Send it to your patient via WhatsApp / Email / SMS"],
                ["5","Patient uploads the QR image on their Patient Dashboard"],
                ["6","Full prescription details appear on their screen instantly ✅"],
              ].map(([n,t]) => (
                <div className="step-row" key={n}>
                  <span className="step-badge">{n}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          {showQrForm && (
            <div style={{ background:"white", borderRadius:16, padding:24, boxShadow:"0 4px 20px rgba(75,0,130,0.08)", marginTop:16, animation:"fadeUp 0.3s ease" }}>
              <h6 className="fw-bold mb-4" style={{ color:"#4B0082", fontSize:15 }}>🩺 Prescription Details</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Patient Name</label>
                  <input className="form-control rounded-3" placeholder="e.g. Rahul Sharma"
                    value={rxForm.patientName} onChange={e => setRxForm({...rxForm, patientName:e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Doctor Name</label>
                  <input className="form-control rounded-3" value={rxForm.doctorName}
                    onChange={e => setRxForm({...rxForm, doctorName:e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">💊 Medicine Name *</label>
                  <input className="form-control rounded-3" placeholder="e.g. Amoxicillin 500mg"
                    value={rxForm.medicine} onChange={e => setRxForm({...rxForm, medicine:e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Dosage</label>
                  <input className="form-control rounded-3" placeholder="e.g. 1 tablet"
                    value={rxForm.dosage} onChange={e => setRxForm({...rxForm, dosage:e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Frequency</label>
                  <select className="form-select rounded-3" value={rxForm.frequency}
                    onChange={e => setRxForm({...rxForm, frequency:e.target.value})}>
                    <option value="">Select</option>
                    <option>Once a day</option>
                    <option>Twice a day</option>
                    <option>Three times a day</option>
                    <option>Before meals</option>
                    <option>After meals</option>
                    <option>At bedtime</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Duration</label>
                  <input className="form-control rounded-3" placeholder="e.g. 5 days"
                    value={rxForm.duration} onChange={e => setRxForm({...rxForm, duration:e.target.value})} />
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Special Instructions</label>
                  <input className="form-control rounded-3" placeholder="e.g. Take after food, avoid alcohol"
                    value={rxForm.instructions} onChange={e => setRxForm({...rxForm, instructions:e.target.value})} />
                </div>
                <div className="col-12 d-flex gap-2 flex-wrap">
                  <button className="gen-btn" onClick={handleGenerateQR}>🔲 Generate QR Code</button>
                  <button className="btn btn-outline-secondary rounded-pill" onClick={() => { setRxForm(emptyRx); setQrValue(""); setQrGenerated(false); }}>Reset</button>
                </div>
              </div>
            </div>
          )}

          {/* QR Result */}
          {qrValue && (
            <div className="qr-result">
              <h6 style={{ color:"#2ecc71", fontWeight:700, fontSize:16 }}>✅ QR Code Ready!</h6>
              <p className="text-muted" style={{ fontSize:13 }}>Download this QR and send it to <strong>{rxForm.patientName || "the patient"}</strong></p>

              {/* QR Code */}
              <div style={{ display:"inline-block", padding:16, background:"white", borderRadius:16, boxShadow:"0 4px 20px rgba(0,0,0,0.12)", marginBottom:16 }}>
                <QRCodeCanvas ref={qrRef} value={qrValue} size={220} level="H" />
              </div>

              {/* Prescription Summary */}
              <div className="rx-table">
                {[
                  ["Patient",      rxForm.patientName],
                  ["Doctor",       `Dr. ${rxForm.doctorName}`],
                  ["Medicine",     rxForm.medicine],
                  ["Dosage",       rxForm.dosage],
                  ["Frequency",    rxForm.frequency],
                  ["Duration",     rxForm.duration],
                  ["Instructions", rxForm.instructions],
                  ["Date",         new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })],
                ].map(([l,v]) => v ? (
                  <div className="rx-row" key={l}>
                    <span className="rx-lbl">{l}:</span>
                    <span>{v}</span>
                  </div>
                ) : null)}
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2 flex-wrap justify-content-center mt-3">
                <button className="dl-btn" onClick={handleDownloadQR}>⬇️ Download QR Image</button>
                <button className="wa-btn" onClick={handleWhatsApp}>📱 Share on WhatsApp</button>
                <button className="btn btn-outline-secondary rounded-pill" onClick={handleCopy}>
                  {copied ? "✅ Copied!" : "📋 Copy Text"}
                </button>
              </div>

              <div style={{ background:"#fff8e1", borderRadius:10, padding:"12px 16px", marginTop:16, fontSize:13, color:"#b8860b" }}>
                💡 <strong>Tip:</strong> Download the QR image → Send via WhatsApp/Email to {rxForm.patientName || "patient"} → They upload it on their Patient Dashboard to view the prescription.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="text-white pt-5 pb-3" style={{ background:"linear-gradient(135deg,#2c0060,#4B0082)" }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="fw-bold">🏥 MedQRate</h5>
              <p className="mt-2" style={{ opacity:0.8 }}>Smart Healthcare Appointment & Prescription Management System.</p>
              <p>📍 Chinchwad, Pune, Maharashtra</p>
              <p>📧 healthcare@gmail.com</p>
              <p>📞 +91 9876543210</p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold">⏳ Appointment Timing</h5>
              <p className="mt-2">Mon – Fri: 9AM – 6PM</p>
              <p>Saturday: 9AM – 2PM</p>
              <p>Sunday: Closed</p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold">📊 Social</h5>
              <p className="mt-2">Instagram</p><p>Facebook</p><p>Youtube</p><p>Linkedin</p>
            </div>
          </div>
          <hr style={{ opacity:0.3 }} />
          <p className="text-center mb-0" style={{ opacity:0.7 }}>© 2026 MedQRate. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default DoctorHome;