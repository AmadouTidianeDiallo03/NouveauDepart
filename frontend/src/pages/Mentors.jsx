import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function MentorCard({ mentor }) {
    const avatarLetter = mentor.first_name?.[0]?.toUpperCase() || "M";
    const gradients = [
        "linear-gradient(135deg, #6366f1, #8b5cf6)",
        "linear-gradient(135deg, #0ea5e9, #6366f1)",
        "linear-gradient(135deg, #10b981, #0ea5e9)",
        "linear-gradient(135deg, #f59e0b, #ef4444)",
        "linear-gradient(135deg, #ec4899, #8b5cf6)",
    ];
    const gradient = gradients[(mentor.id || 0) % gradients.length];
    const langLabel = mentor.profile?.language === "en" ? "🇬🇧 English" : "🇫🇷 Français";

    return (
        <div style={{
            background: "#fff",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #f1f5f9",
            transition: "transform 0.2s, box-shadow 0.2s",
            display: "flex",
            flexDirection: "column",
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(99,102,241,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}
        >
            {/* Card top banner */}
            <div style={{ background: gradient, height: 80, position: "relative" }}>
                {/* Avatar */}
                <div style={{
                    position: "absolute", bottom: -28, left: "1.25rem",
                    width: 56, height: 56, borderRadius: "50%",
                    background: mentor.profile?.avatar_url ? "transparent" : "rgba(255,255,255,0.2)",
                    border: "3px solid #fff",
                    overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem", fontWeight: 800, color: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}>
                    {mentor.profile?.avatar_url
                        ? <img src={mentor.profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : avatarLetter
                    }
                </div>
            </div>

            <div style={{ padding: "2.5rem 1.25rem 1.25rem" }}>
                {/* Name + badges */}
                <div style={{ marginBottom: "0.75rem" }}>
                    <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a" }}>
                        {mentor.first_name} {mentor.last_name}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        {mentor.profile?.university?.name || "Université non indiquée"}
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
                    <span style={{ background: "#ede9fe", color: "#7c3aed", borderRadius: "999px", padding: "0.2rem 0.65rem", fontSize: "0.75rem", fontWeight: 600 }}>
                        ⭐ Mentor
                    </span>
                    <span style={{ background: "#f0fdf4", color: "#166534", borderRadius: "999px", padding: "0.2rem 0.65rem", fontSize: "0.75rem", fontWeight: 600 }}>
                        {langLabel}
                    </span>
                    {mentor.profile?.city && (
                        <span style={{ background: "#f0f9ff", color: "#0369a1", borderRadius: "999px", padding: "0.2rem 0.65rem", fontSize: "0.75rem", fontWeight: 600 }}>
                            📍 {mentor.profile.city}
                        </span>
                    )}
                </div>

                {mentor.profile?.bio ? (
                    <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.6, marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {mentor.profile.bio}
                    </p>
                ) : (
                    <p style={{ fontSize: "0.88rem", color: "#94a3b8", fontStyle: "italic", marginBottom: "1rem" }}>
                        Ce mentor n'a pas encore rempli sa bio.
                    </p>
                )}

                <Link to={`/chat/${mentor.id}`} style={{
                    display: "block",
                    textAlign: "center",
                    padding: "0.65rem",
                    borderRadius: "12px",
                    background: gradient,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    transition: "opacity 0.2s",
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                    💬 Contacter
                </Link>
            </div>
        </div>
    );
}

export default function Mentors() {
    const [mentors, setMentors] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [filters, setFilters] = useState({ university_id: "", city: "", language: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/universities/").then((r) => setUniversities(r.data.results || r.data));
        fetchMentors({});
    }, []);

    async function fetchMentors(params) {
        setLoading(true);
        try {
            const res = await api.get("/mentors/", { params });
            setMentors(res.data);
        } finally {
            setLoading(false);
        }
    }

    function handleFilter(e) {
        const newFilters = { ...filters, [e.target.name]: e.target.value };
        setFilters(newFilters);
        const params = Object.fromEntries(Object.entries(newFilters).filter(([, v]) => v));
        fetchMentors(params);
    }

    return (
        <div className="page-content" style={{ background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)", minHeight: "100vh" }}>
            {/* Hero */}
            <div style={{
                background: "linear-gradient(135deg, #064e3b, #059669, #10b981)",
                padding: "2.5rem 0 4.5rem",
                marginBottom: "-2.5rem",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(16,185,129,0.2)" }} />
                <div className="container">
                    <h1 style={{ color: "#fff", marginBottom: "0.4rem" }}>Trouver un Mentor 🤝</h1>
                    <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "0.95rem" }}>
                        Des étudiants expérimentés, prêts à t'accompagner dans ton intégration au Québec.
                    </p>
                </div>
            </div>

            <div className="container" style={{ position: "relative", zIndex: 1 }}>
                {/* Filters card */}
                <div style={{
                    background: "#fff",
                    borderRadius: "20px",
                    padding: "1.25rem 1.5rem",
                    marginBottom: "2rem",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end",
                }}>
                    <div style={{ flex: "1 1 200px" }}>
                        <label className="form-label">🎓 Université</label>
                        <select name="university_id" className="form-select" value={filters.university_id} onChange={handleFilter}>
                            <option value="">Toutes les universités</option>
                            {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: "1 1 160px" }}>
                        <label className="form-label">📍 Ville</label>
                        <input name="city" type="text" className="form-input" value={filters.city} onChange={handleFilter} placeholder="Lévis, Montréal…" />
                    </div>
                    <div style={{ flex: "1 1 130px" }}>
                        <label className="form-label">🌐 Langue</label>
                        <select name="language" className="form-select" value={filters.language} onChange={handleFilter}>
                            <option value="">Toutes</option>
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="spinner" />
                ) : mentors.length === 0 ? (
                    <div style={{
                        background: "#fff", borderRadius: "20px", padding: "3rem",
                        textAlign: "center", color: "#94a3b8", boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                    }}>
                        <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔎</div>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "1.05rem" }}>Aucun mentor trouvé</div>
                        <div style={{ fontSize: "0.88rem", marginTop: "0.3rem" }}>Essaie de modifier tes filtres</div>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: "1rem", color: "#64748b", fontSize: "0.88rem", fontWeight: 600 }}>
                            {mentors.length} mentor{mentors.length > 1 ? "s" : ""} disponible{mentors.length > 1 ? "s" : ""}
                        </div>
                        <div className="grid grid-3">
                            {mentors.map((m) => <MentorCard key={m.id} mentor={m} />)}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
