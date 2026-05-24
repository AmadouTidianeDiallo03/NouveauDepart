import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function MentorAppointments() {
    const [searchParams] = useSearchParams();
    const [mentors, setMentors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedMentor, setSelectedMentor] = useState("");
    const [availabilities, setAvailabilities] = useState([]);
    const [form, setForm] = useState({ date: "", start_time: "", end_time: "", meeting_type: "chat", message: "" });
    const [message, setMessage] = useState("");

    useEffect(() => {
        api.get("/mentors/available/").then((res) => setMentors(res.data.results || res.data));
        api.get("/mentor-appointments/my/").then((res) => setAppointments(res.data.results || res.data));
        const mentorId = searchParams.get("mentor_id");
        if (mentorId) setSelectedMentor(mentorId);
    }, []);

    useEffect(() => {
        if (!selectedMentor) return;
        api.get(`/mentors/${selectedMentor}/availability/`).then((res) => setAvailabilities(res.data.results || res.data));
    }, [selectedMentor]);

    async function submit(e) {
        e.preventDefault();
        await api.post("/mentor-appointments/", { ...form, mentor: selectedMentor });
        setMessage("Demande de rendez-vous envoyée.");
        const res = await api.get("/mentor-appointments/my/");
        setAppointments(res.data.results || res.data);
    }

    return (
        <div className="page-content" style={{ background: "#f6f8fc", minHeight: "100vh" }}>
            <div className="container-lg">
                <section style={heroStyle}>
                    <h1>Prendre rendez-vous avec un mentor</h1>
                    <p>Choisis un mentor, un créneau et le mode de rencontre qui te convient.</p>
                </section>
                {message && <div style={successStyle}>{message}</div>}
                <div style={layoutStyle}>
                    <section style={cardStyle}>
                        <h2>Mentors disponibles</h2>
                        <div style={gridStyle}>
                            {mentors.map((mentor) => (
                                <button key={mentor.id} onClick={() => setSelectedMentor(String(mentor.id))} style={mentorCardStyle(selectedMentor === String(mentor.id))}>
                                    <strong>{mentor.full_name || mentor.email}</strong>
                                    <span>{mentor.university?.name || "Université non renseignée"}</span>
                                    <small>{mentor.specialties || "Aide générale"}</small>
                                </button>
                            ))}
                        </div>
                    </section>
                    <form onSubmit={submit} style={cardStyle}>
                        <h2>Demande de rendez-vous</h2>
                        <label style={labelStyle}>Date<input required type="date" style={inputStyle} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
                        <label style={labelStyle}>Heure de début<input required type="time" style={inputStyle} value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></label>
                        <label style={labelStyle}>Heure de fin<input required type="time" style={inputStyle} value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></label>
                        <label style={labelStyle}>Mode<select style={inputStyle} value={form.meeting_type} onChange={(e) => setForm({ ...form, meeting_type: e.target.value })}>
                            <option value="chat">Clavardage</option>
                            <option value="video">Appel vidéo</option>
                            <option value="in_person">Rencontre en personne</option>
                        </select></label>
                        <label style={labelStyle}>Message<textarea style={inputStyle} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
                        <button disabled={!selectedMentor} style={buttonStyle}>Envoyer la demande</button>
                        <h3>Disponibilités</h3>
                        {availabilities.length ? availabilities.map((a) => <p key={a.id}>{a.day_of_week} · {a.start_time} - {a.end_time}</p>) : <p style={{ color: "#64748b" }}>Choisis un mentor pour voir ses disponibilités.</p>}
                    </form>
                </div>
                <section style={{ ...cardStyle, marginTop: "1rem" }}>
                    <h2>Mes rendez-vous à venir</h2>
                    {appointments.length ? appointments.map((a) => (
                        <div key={a.id} style={appointmentStyle}>
                            <strong>{a.mentor_info?.full_name || a.mentor_info?.email}</strong>
                            <span>{a.date} · {a.start_time} · {a.status_label}</span>
                        </div>
                    )) : <p>Tu n’as pas encore de rendez-vous avec un mentor.</p>}
                </section>
            </div>
        </div>
    );
}

const heroStyle = { background: "linear-gradient(135deg,#07152e,#1d4ed8)", color: "#fff", borderRadius: 24, padding: "2rem", marginBottom: "1rem" };
const layoutStyle = { display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: "1rem" };
const cardStyle = { background: "#fff", border: "1px solid #dbe5f4", borderRadius: 18, padding: "1.25rem", boxShadow: "0 18px 45px rgba(15,23,42,.07)" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: ".8rem" };
const mentorCardStyle = (active) => ({ textAlign: "left", border: `1px solid ${active ? "#1d4ed8" : "#dbe5f4"}`, background: active ? "#eff6ff" : "#fff", borderRadius: 14, padding: "1rem", display: "grid", gap: ".3rem", cursor: "pointer" });
const labelStyle = { display: "grid", gap: ".3rem", marginBottom: ".75rem", color: "#334155", fontWeight: 800 };
const inputStyle = { border: "1px solid #dbe5f4", borderRadius: 12, padding: ".75rem", font: "inherit" };
const buttonStyle = { width: "100%", border: 0, borderRadius: 12, background: "#1d4ed8", color: "#fff", padding: ".8rem 1rem", fontWeight: 850, cursor: "pointer" };
const successStyle = { background: "#dcfce7", color: "#166534", borderRadius: 14, padding: "1rem", marginBottom: "1rem", fontWeight: 800 };
const appointmentStyle = { border: "1px solid #dbe5f4", borderRadius: 14, padding: ".9rem", display: "grid", gap: ".25rem", marginTop: ".6rem" };
