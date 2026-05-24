import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const categories = ["tous", "accueil", "immigration", "emploi", "rencontre", "integration"];

export default function Events() {
    const [events, setEvents] = useState([]);
    const [category, setCategory] = useState("tous");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/events/")
            .then((res) => setEvents(res.data.results || res.data))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => category === "tous" ? events : events.filter((event) => event.category === category), [events, category]);

    return (
        <div className="page-content" style={{ background: "#f6f8fc", minHeight: "100vh" }}>
            <div className="container-lg">
                <Header title="Calendrier des événements d’intégration" desc="Retrouve les activités utiles pour découvrir le campus, rencontrer d’autres étudiants et préparer tes démarches." />
                <div style={filtersStyle}>
                    {categories.map((item) => (
                        <button key={item} onClick={() => setCategory(item)} style={pillStyle(category === item)}>
                            {item === "tous" ? "Tous" : item}
                        </button>
                    ))}
                </div>
                {loading ? <p>Chargement...</p> : (
                    <div style={gridStyle}>
                        {filtered.map((event) => <EventCard key={event.id} event={event} />)}
                    </div>
                )}
            </div>
        </div>
    );
}

function EventCard({ event }) {
    const date = new Date(event.start_date);
    return (
        <article style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <span style={badgeStyle}>{event.category_label || event.category}</span>
                <strong style={{ color: "#1d4ed8" }}>{date.toLocaleDateString("fr-CA")}</strong>
            </div>
            <h2 style={{ margin: "1rem 0 0.4rem", color: "#0f172a" }}>{event.title}</h2>
            <p style={{ color: "#64748b", lineHeight: 1.55 }}>{event.description}</p>
            <div style={{ color: "#334155", fontWeight: 700, fontSize: "0.9rem" }}>
                {date.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })} · {event.location || event.campus || "Lieu à confirmer"}
            </div>
            <div style={{ color: "#64748b", marginTop: "0.35rem" }}>{event.university_name || "Ouvert aux étudiants"} {event.campus ? `· ${event.campus}` : ""}</div>
            <button style={buttonStyle}>Participer</button>
        </article>
    );
}

function Header({ title, desc }) {
    return (
        <section style={heroStyle}>
            <h1>{title}</h1>
            <p>{desc}</p>
        </section>
    );
}

const heroStyle = { background: "linear-gradient(135deg,#07152e,#1d4ed8)", color: "#fff", borderRadius: 24, padding: "2rem", marginBottom: "1rem" };
const filtersStyle = { display: "flex", flexWrap: "wrap", gap: ".6rem", marginBottom: "1rem" };
const pillStyle = (active) => ({ border: "1px solid #bfdbfe", background: active ? "#1d4ed8" : "#fff", color: active ? "#fff" : "#1d4ed8", borderRadius: 999, padding: ".55rem .9rem", fontWeight: 800, cursor: "pointer" });
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1rem" };
const cardStyle = { background: "#fff", border: "1px solid #dbe5f4", borderRadius: 18, padding: "1.25rem", boxShadow: "0 18px 45px rgba(15,23,42,.07)" };
const badgeStyle = { background: "#eff6ff", color: "#1d4ed8", borderRadius: 999, padding: ".3rem .65rem", fontWeight: 850, fontSize: ".78rem" };
const buttonStyle = { marginTop: "1rem", border: 0, borderRadius: 12, background: "#1d4ed8", color: "#fff", padding: ".72rem 1rem", fontWeight: 850, cursor: "pointer" };
