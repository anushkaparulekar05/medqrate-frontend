import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// ── Alarm sound ──
function playAlarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[0,880,0.18],[0.25,1046,0.18],[0.5,1318,0.28],[1,880,0.18],[1.25,1046,0.18],[1.5,1318,0.28]]
      .forEach(([t,f,d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f; o.type = "sine";
        g.gain.setValueAtTime(0, ctx.currentTime+t);
        g.gain.linearRampToValueAtTime(0.5, ctx.currentTime+t+0.02);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime+t+d);
        o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+d+0.05);
      });
  } catch(e) {}
}

function PatientHome() {
  const user      = JSON.parse(localStorage.getItem("user"));
  const patientId = user?.id;

  const [doctors,       setDoctors]       = useState([]);
  const [appointments,  setAppointments]  = useState([]);
  const [search,        setSearch]        = useState("");
  const [selectedDoc,   setSelectedDoc]   = useState(null);
  const [enquiry,       setEnquiry]       = useState("");
  const [loading,       setLoading]       = useState(false);

  // View prescription QR modal
  const [viewingRx, setViewingRx] = useState(null);

  // Reminder state
  const emptyForm = { medicineName:"", times:[""], frequency:"daily", notes:"", sound:true };
  const [reminders,        setReminders]        = useState(() => {
    try { return JSON.parse(localStorage.getItem("medReminders_"+patientId)) || []; }
    catch { return []; }
  });
  const [reminderForm,     setReminderForm]     = useState(emptyForm);
  const [notifPerm,        setNotifPerm]        = useState(typeof Notification!=="undefined" ? Notification.permission : "denied");
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [toast,            setToast]            = useState(null);
  const intervalRef = useRef(null);

  // ── Persist reminders ──
  useEffect(() => {
    localStorage.setItem("medReminders_"+patientId, JSON.stringify(reminders));
  }, [reminders, patientId]);

  // ── Load doctors ──
  useEffect(() => {
    axios.get(`${BASE_URL}/auth/doctors`).then(r => setDoctors(r.data)).catch(console.log);
  }, []);

  // ── Load appointments ──
  const loadAppointments = async () => {
    try { const r = await axios.get(`${BASE_URL}/appointments/patient/${patientId}`); setAppointments(r.data); }
    catch(e) { console.log(e); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (patientId) loadAppointments(); }, [patientId]);

  // ── Book appointment ──
  const handleBook = async () => {
    if (!enquiry.trim()) { alert("Please enter your enquiry."); return; }
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/appointments/book/${patientId}/${selectedDoc.id}`, { enquiry });
      alert("🎉 Appointment submitted successfully!");
      setSelectedDoc(null); setEnquiry(""); loadAppointments();
    } catch { alert("Error booking appointment."); }
    finally { setLoading(false); }
  };

  // ── Reminder checker ──
  useEffect(() => {
    const check = () => {
      const now  = new Date();
      const hhmm = now.toTimeString().slice(0,5);
      const day  = now.toLocaleDateString("en-US", { weekday:"long" });
      reminders.forEach(r => {
        if (!r.active) return;
        const ok = r.frequency==="daily" || (r.frequency==="weekdays" && !["Saturday","Sunday"].includes(day)) || (r.frequency==="weekends" && ["Saturday","Sunday"].includes(day)) || r.frequency==="once";
        if (!ok) return;
        (r.times||[]).forEach(t => {
          if (t!==hhmm) return;
          const key = `fired_${r.id}_${now.toDateString()}_${t}`;
          if (sessionStorage.getItem(key)) return;
          sessionStorage.setItem(key,"1");
          if (r.sound!==false) playAlarm();
          setToast({ medicineName:r.medicineName, notes:r.notes });
          setTimeout(() => setToast(null), 10000);
          if (Notification.permission==="granted") new Notification("💊 Medicine Reminder — MedQRate", { body:`Time to take: ${r.medicineName}` });
          if (r.frequency==="once") setReminders(prev => prev.map(x => x.id===r.id ? {...x,active:false}:x));
        });
      });
    };
    intervalRef.current = setInterval(check, 30000);
    check();
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders]);

  const addTimeSlot    = ()    => reminderForm.times.length<6 && setReminderForm(f => ({...f, times:[...f.times,""]}));
  const removeTimeSlot = (i)   => reminderForm.times.length>1 && setReminderForm(f => ({...f, times:f.times.filter((_,j)=>j!==i)}));
  const changeTime     = (i,v) => { const t=[...reminderForm.times]; t[i]=v; setReminderForm(f=>({...f,times:t})); };

  const handleAddReminder = () => {
    const vt = reminderForm.times.filter(t=>t.trim());
    if (!reminderForm.medicineName.trim()||!vt.length) { alert("Enter medicine name and at least one time."); return; }
    setReminders(prev => [...prev, { id:Date.now(), ...reminderForm, times:vt, active:true }]);
    setReminderForm(emptyForm); setShowReminderForm(false);
  };

  // ── Set reminder from prescription ──
  const handleSetReminderFromAppt = (app) => {
    setReminderForm(f => ({ ...f, medicineName: `Dr. ${app.doctor?.name}'s prescription`, notes: app.enquiry || "" }));
    setShowReminderForm(true);
    document.getElementById("reminder-anchor")?.scrollIntoView({ behavior:"smooth" });
  };

  const filteredDocs = doctors.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()));
  const freqLabel    = { daily:"Every Day", weekdays:"Weekdays", weekends:"Weekends", once:"Once" };
  const freqColor    = { daily:"#4B0082",   weekdays:"#1e90ff", weekends:"#e67e22",   once:"#2ecc71" };

  // Approved prescriptions with QR image
  const approvedWithRx = appointments.filter(a => a.status==="APPROVED" && a.imagePath);

  return (
    <>
      <style>{`
        .p-navbar { background:linear-gradient(135deg,#4B0082,#2c0060); box-shadow:0 4px 20px rgba(75,0,130,0.3); }
        .sec-card { background:rgba(255,255,255,0.9); backdrop-filter:blur(10px); border-radius:20px; padding:24px; box-shadow:0 4px 18px rgba(0,0,0,0.08); margin-bottom:24px; }
        .doc-card { border-radius:16px; border:none; box-shadow:0 3px 14px rgba(0,0,0,0.06); transition:transform 0.2s; background:rgba(255,255,255,0.9); }
        .doc-card:hover { transform:translateY(-3px); }
        .appt-card { border-radius:14px; border:none; box-shadow:0 3px 12px rgba(0,0,0,0.06); border-left:4px solid #4B0082; background:rgba(255,255,255,0.9); }
        /* Prescription QR cards */
        .rx-appt-card { background:rgba(255,255,255,0.92); border-radius:16px; padding:20px; box-shadow:0 4px 18px rgba(0,0,0,0.08); border-left:5px solid #2ecc71; margin-bottom:14px; animation:fadeUp 0.3s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        /* QR Modal */
        .rx-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px; backdrop-filter:blur(4px); }
        .rx-modal { background:white; border-radius:24px; padding:30px; max-width:440px; width:100%; box-shadow:0 20px 60px rgba(0,0,0,0.4); animation:fadeUp 0.3s ease; text-align:center; }
        /* Reminder */
        .rem-wrap { background:rgba(245,240,255,0.92); backdrop-filter:blur(10px); border-radius:20px; padding:26px; border:2px solid #e0d0ff; }
        .rem-card { background:rgba(255,255,255,0.9); border-radius:14px; padding:16px 18px; margin-bottom:10px; box-shadow:0 3px 12px rgba(0,0,0,0.06); border-left:4px solid #4B0082; display:flex; align-items:center; justify-content:space-between; transition:transform 0.2s; }
        .rem-card:hover { transform:translateX(4px); }
        .rem-card.off  { opacity:0.5; border-left-color:#ccc; }
        .add-btn { background:linear-gradient(135deg,#4B0082,#1e90ff); color:white; border:none; border-radius:50px; padding:10px 24px; font-weight:700; cursor:pointer; }
        .time-row { display:flex; gap:10px; align-items:center; margin-bottom:10px; }
        .time-row input[type=time] { flex:1; border:1.5px solid #ddd; border-radius:12px; padding:8px 14px; font-size:15px; }
        .time-row input[type=time]:focus { border-color:#4B0082; outline:none; }
        .add-time-btn { border:2px dashed #4B0082; background:transparent; color:#4B0082; border-radius:50px; padding:7px 18px; font-weight:600; cursor:pointer; font-size:13px; }
        .toggle { width:46px; height:24px; border-radius:50px; background:#ccc; border:none; cursor:pointer; position:relative; transition:background 0.3s; flex-shrink:0; }
        .toggle.on { background:#4B0082; }
        .toggle::after { content:''; position:absolute; width:18px; height:18px; background:white; border-radius:50%; top:3px; left:3px; transition:left 0.3s; }
        .toggle.on::after { left:25px; }
        .notif-bar { background:linear-gradient(135deg,#fff8e1,#fff3cd); border-radius:12px; padding:12px 16px; margin-bottom:14px; border:1px solid #ffc107; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
        .toast-pop { position:fixed; top:80px; right:20px; z-index:9999; min-width:320px; background:linear-gradient(135deg,#4B0082,#1e90ff); color:white; border-radius:18px; padding:18px 20px; box-shadow:0 10px 40px rgba(75,0,130,0.45); animation:slideIn 0.4s ease; }
        @keyframes slideIn { from{transform:translateX(120%)} to{transform:translateX(0)} }
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div className="toast-pop">
          <div className="d-flex gap-3 align-items-start">
            <span style={{ fontSize:30 }}>💊</span>
            <div>
              <div className="fw-bold" style={{ fontSize:15 }}>Time to take your medicine!</div>
              <div>{toast.medicineName}</div>
              {toast.notes && <div style={{ fontSize:12, opacity:0.85 }}>{toast.notes}</div>}
            </div>
          </div>
          <button onClick={()=>setToast(null)} style={{ marginTop:10,width:"100%",background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:5,fontWeight:600,cursor:"pointer" }}>✓ Dismiss</button>
        </div>
      )}

      {/* ── PRESCRIPTION QR MODAL ── */}
      {viewingRx && (
        <div className="rx-modal-overlay" onClick={()=>setViewingRx(null)}>
          <div className="rx-modal" onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:32, marginBottom:8 }}>🩺</div>
            <h5 className="fw-bold mb-1" style={{ color:"#4B0082" }}>Your Prescription</h5>
            <p className="text-muted mb-3" style={{ fontSize:13 }}>From Dr. {viewingRx.doctor?.name}</p>

            <div style={{ background:"#f8f5ff", borderRadius:14, padding:16, marginBottom:18 }}>
              <img src={viewingRx.imagePath} alt="Prescription QR"
                style={{ maxWidth:"100%", maxHeight:300, borderRadius:10, objectFit:"contain" }}
                onError={e=>{ e.target.style.display="none"; }} />
            </div>

            <div style={{ background:"#f0fff8", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#1a7a4a", marginBottom:16, textAlign:"left" }}>
              <strong>📋 How to use:</strong> Save this QR image → your doctor's prescription info is encoded inside it.
            </div>

            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <button className="btn btn-primary rounded-pill px-4" onClick={()=>handleSetReminderFromAppt(viewingRx)}>
                ⏰ Set Medicine Reminder
              </button>
              <button className="btn btn-outline-secondary rounded-pill" onClick={()=>setViewingRx(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav className="navbar navbar-expand-lg px-4 px-md-5 py-3 p-navbar">
        <div className="d-flex align-items-center">
          <span style={{ fontSize:28, marginRight:10 }}>🏥</span>
          <div>
            <h5 className="fw-bold text-white mb-0">MedQRate</h5>
            <div style={{ fontSize:11, color:"#d4b8ff" }}>Patient Dashboard</div>
          </div>
        </div>
        <div className="ms-auto d-flex align-items-center gap-3">
          <div className="text-white text-end d-none d-md-block">
            <div className="fw-bold">Hello, {user?.name} 👋</div>
            <div style={{ fontSize:12, opacity:0.75 }}>Patient</div>
          </div>
          <button className="btn btn-danger btn-sm rounded-pill" onClick={() => { localStorage.removeItem("user"); window.location="/"; }}>Logout</button>
        </div>
      </nav>

      <div className="container py-4">

        {/* ── SEARCH DOCTORS ── */}
        <div className="sec-card">
          <h5 className="fw-bold mb-3">👨‍⚕️ Find a Doctor</h5>
          <input type="text" className="form-control rounded-pill p-3 shadow-sm mb-4"
            placeholder="🔍 Search by name..." value={search} onChange={e=>setSearch(e.target.value)} />
          <div className="row g-3">
            {filteredDocs.map(doc => (
              <div className="col-md-6" key={doc.id}>
                <div className="doc-card card p-3">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ width:50, height:50, borderRadius:"50%", background:"linear-gradient(135deg,#4B0082,#1e90ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🩺</div>
                    <div style={{ flex:1 }}>
                      <div className="fw-bold">{doc.name}</div>
                      <div className="text-muted" style={{ fontSize:12 }}>{doc.speciality} • {doc.address}</div>
                    </div>
                    <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={()=>setSelectedDoc(doc)}>Book</button>
                  </div>
                </div>
              </div>
            ))}
            {filteredDocs.length===0 && <p className="text-muted">No doctors found.</p>}
          </div>
        </div>

        {/* ── BOOK APPOINTMENT ── */}
        {selectedDoc && (
          <div className="sec-card" style={{ border:"2px solid #4B0082" }}>
            <h5 className="fw-bold mb-3">📅 Book Appointment with Dr. {selectedDoc.name}</h5>
            <textarea className="form-control mb-3 rounded-3" rows={3} placeholder="Describe your symptoms or enquiry..."
              value={enquiry} onChange={e=>setEnquiry(e.target.value)} />
            <div className="d-flex gap-2">
              <button className="btn btn-success rounded-pill px-4" onClick={handleBook} disabled={loading}>{loading?"⏳ Submitting...":"✅ Submit"}</button>
              <button className="btn btn-outline-secondary rounded-pill" onClick={()=>setSelectedDoc(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── MY APPOINTMENTS ── */}
        <div className="sec-card">
          <h5 className="fw-bold mb-3">📅 My Appointments</h5>
          {appointments.length===0 && <p className="text-muted">No appointments yet.</p>}
          {appointments.map(app => (
            <div key={app.id} className="appt-card card p-3 mb-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <div className="fw-bold">Dr. {app.doctor?.name}</div>
                  <div className="text-muted" style={{ fontSize:13 }}>📝 {app.enquiry}</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {app.status==="PENDING" && <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">⏳ Pending</span>}
                  {app.status==="APPROVED" && !app.imagePath && <span className="badge bg-success px-3 py-2 rounded-pill">✅ Approved</span>}
                  {app.status==="APPROVED" && app.imagePath && (
                    <button className="btn btn-success btn-sm rounded-pill" onClick={()=>setViewingRx(app)}>
                      📲 View Prescription QR
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* ============== 📋 MY PRESCRIPTIONS (from Doctor QR) =========== */}
      {/* ================================================================ */}
      <div className="container mb-4">
        <div style={{ background:"rgba(232,255,244,0.92)", backdropFilter:"blur(10px)", borderRadius:20, padding:26, border:"2px solid #b2f0d8" }}>
          <h4 className="fw-bold mb-1" style={{ color:"#1a7a4a" }}>📋 My Prescription QRs</h4>
          <p className="text-muted mb-4" style={{ fontSize:13 }}>
            Prescriptions your doctor sent you — click to view the QR code
          </p>

          {approvedWithRx.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <div style={{ fontSize:52 }}>📭</div>
              <p className="mt-2">No prescriptions received yet.<br />
                Once your doctor approves your appointment and sends a prescription, it will appear here.
              </p>
            </div>
          ) : (
            approvedWithRx.map(app => (
              <div key={app.id} className="rx-appt-card">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ width:48, height:48, background:"linear-gradient(135deg,#2ecc71,#1abc9c)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🩺</div>
                    <div>
                      <div className="fw-bold">Dr. {app.doctor?.name}</div>
                      <div className="text-muted" style={{ fontSize:13 }}>📝 {app.enquiry}</div>
                      <span className="badge bg-success mt-1 rounded-pill">✅ Prescription Ready</span>
                    </div>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-success rounded-pill px-3" onClick={()=>setViewingRx(app)}>
                      📲 View QR
                    </button>
                    <button className="btn btn-outline-primary rounded-pill px-3" onClick={()=>handleSetReminderFromAppt(app)}>
                      ⏰ Set Reminder
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* =================== 💊 MEDICINE REMINDERS ==================== */}
      {/* ================================================================ */}
      <div className="container mb-5" id="reminder-anchor">
        <div className="rem-wrap">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-2">
            <div>
              <h4 className="mb-0 fw-bold" style={{ color:"#4B0082" }}>💊 Medicine Reminders</h4>
              <p className="text-muted mb-0" style={{ fontSize:13, marginTop:4 }}>Set alarms — never miss a dose</p>
            </div>
            <button className="add-btn" onClick={()=>setShowReminderForm(!showReminderForm)}>
              {showReminderForm ? "✕ Cancel" : "+ Add Reminder"}
            </button>
          </div>

          {notifPerm!=="granted" && (
            <div className="notif-bar">
              <span>🔔 Allow notifications for background alerts</span>
              <button className="btn btn-warning btn-sm fw-bold" onClick={async()=>{ const r=await Notification.requestPermission(); setNotifPerm(r); }}>Enable</button>
            </div>
          )}
          {notifPerm==="granted" && <div style={{ fontSize:13, color:"#2d8a2d", marginBottom:8 }}>✅ Notifications enabled</div>}

          {/* Form */}
          {showReminderForm && (
            <div style={{ background:"rgba(255,255,255,0.95)", borderRadius:16, padding:22, boxShadow:"0 4px 18px rgba(75,0,130,0.1)", marginTop:16, animation:"fadeUp 0.3s ease" }}>
              <h6 className="fw-bold mb-3" style={{ color:"#4B0082" }}>🆕 New Reminder</h6>
              <div className="mb-3">
                <label className="form-label fw-semibold">💊 Medicine Name *</label>
                <input className="form-control rounded-3" placeholder="e.g. Paracetamol 500mg"
                  value={reminderForm.medicineName} onChange={e=>setReminderForm(f=>({...f,medicineName:e.target.value}))} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">🕐 Time(s) * <span style={{ fontSize:12, color:"#888", fontWeight:400 }}>(up to 6)</span></label>
                {reminderForm.times.map((t,i)=>(
                  <div className="time-row" key={i}>
                    <input type="time" value={t} onChange={e=>changeTime(i,e.target.value)} />
                    <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={()=>removeTimeSlot(i)} disabled={reminderForm.times.length===1}>✕</button>
                  </div>
                ))}
                {reminderForm.times.length<6 && <button className="add-time-btn" onClick={addTimeSlot}>+ Add Time</button>}
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Frequency</label>
                  <select className="form-select rounded-3" value={reminderForm.frequency} onChange={e=>setReminderForm(f=>({...f,frequency:e.target.value}))}>
                    <option value="daily">Every Day</option>
                    <option value="weekdays">Weekdays (Mon–Fri)</option>
                    <option value="weekends">Weekends (Sat–Sun)</option>
                    <option value="once">Once (Today Only)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Notes</label>
                  <input className="form-control rounded-3" placeholder="e.g. After meals" value={reminderForm.notes} onChange={e=>setReminderForm(f=>({...f,notes:e.target.value}))} />
                </div>
              </div>
              <div className="mb-3">
                <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, fontWeight:500 }}>
                  <input type="checkbox" checked={reminderForm.sound} onChange={e=>setReminderForm(f=>({...f,sound:e.target.checked}))} />
                  🔊 Play alarm sound
                </label>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <button className="add-btn" onClick={handleAddReminder}>💾 Save</button>
                <button className="btn btn-outline-secondary rounded-pill" onClick={()=>{ setShowReminderForm(false); setReminderForm(emptyForm); }}>Cancel</button>
                <button className="btn btn-outline-success rounded-pill ms-auto" onClick={playAlarm}>🔔 Test Sound</button>
              </div>
            </div>
          )}

          {/* Reminder List */}
          <div className="mt-3">
            {reminders.length===0 ? (
              <div className="text-center py-4 text-muted">
                <div style={{ fontSize:46 }}>💊</div>
                <p className="mt-2">No reminders yet. Click <strong>"+ Add Reminder"</strong> to start.</p>
              </div>
            ) : reminders.map(r => (
              <div key={r.id} className={`rem-card ${!r.active?"off":""}`}>
                <div className="d-flex align-items-start gap-3" style={{ flex:1 }}>
                  <span style={{ fontSize:26 }}>💊</span>
                  <div>
                    <div className="fw-bold" style={{ fontSize:14 }}>{r.medicineName}</div>
                    <div className="mt-1">
                      {(r.times||[]).map((t,i)=>(
                        <span key={i} style={{ background:"#ede8ff", color:"#4B0082", borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:600, marginRight:4 }}>🕐 {t}</span>
                      ))}
                    </div>
                    <div className="mt-1 d-flex align-items-center gap-2 flex-wrap">
                      <span style={{ background: freqColor[r.frequency]||"#4B0082", color:"white", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{freqLabel[r.frequency]}</span>
                      {r.sound!==false ? <span style={{ fontSize:12, color:"#888" }}>🔊 Sound</span> : <span style={{ fontSize:12, color:"#ccc" }}>🔇 Muted</span>}
                    </div>
                    {r.notes && <div style={{ fontSize:12, color:"#888", marginTop:4 }}>📝 {r.notes}</div>}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button className={`toggle ${r.active?"on":""}`} onClick={()=>setReminders(prev=>prev.map(x=>x.id===r.id?{...x,active:!x.active}:x))} />
                  <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={()=>setReminders(prev=>prev.filter(x=>x.id!==r.id))}>🗑</button>
                </div>
              </div>
            ))}
          </div>
          {reminders.length>0 && <div className="text-muted mt-2" style={{ fontSize:12 }}>💡 Reminders saved on this device. Keep tab open for in-app alerts.</div>}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="text-white pt-5 pb-3" style={{ background:"linear-gradient(135deg,#2c0060,#4B0082)" }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="fw-bold">🏥 MedQRate</h5>
              <p className="mt-2" style={{ opacity:0.8 }}>Smart Healthcare Appointment & Prescription Management.</p>
              <p>📍 Chinchwad, Pune, Maharashtra</p>
              <p>📧 healthcare@gmail.com</p>
              <p>📞 +91 9876543210</p>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold">⏳ Timings</h5>
              <p className="mt-2">Mon–Fri: 9AM–6PM</p><p>Saturday: 9AM–2PM</p><p>Sunday: Closed</p>
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

export default PatientHome;