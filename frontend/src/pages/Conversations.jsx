import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";

const GRADIENTS = [
    "linear-gradient(135deg, #6366f1, #8b5cf6)",
    "linear-gradient(135deg, #0ea5e9, #6366f1)",
    "linear-gradient(135deg, #10b981, #0ea5e9)",
    "linear-gradient(135deg, #f59e0b, #ef4444)",
    "linear-gradient(135deg, #ec4899, #8b5cf6)",
];

export default function Conversations() {
    const { user } = useAuth();
    const [convs, setConvs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/chat/conversations/")
            .then((r) => setConvs(r.data.results || r.data))
            .finally(() => setLoading(false));
    }, []);

    function formatDate(dt) {
        const d = new Date(dt);
        const now = new Date();
        const diffDays = Math.floor((now - d) / 86400000);
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return "Hier";
        return d.toLocaleDateString("fr-CA", { day: "2-digit", month: "short" });
    }

    if (loading) return <div className="page-content"><div className="spinner" /></div>;

    const isMentor = user?.profile?.role === "mentor";
    const heroBg = isMentor
        ? "linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)"
        : "linear-gradient(135deg, #0c4a6e, #0369a1, #0ea5e9)";

    return (
        <div className="page-content" style={{ background: "linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%)", minHeight: "100vh" }}>
            {/* Hero */}
            <div style={{
                background: heroBg,
                padding: "2.5rem 0 4rem",
                marginBottom: "-2.5rem",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                <div className="container container-sm">
                    <BackButton />
                    <h1 style={{ color: "#fff", marginBottom: "0.4rem" }}>
                        {isMentor ? "Mes Mentorés 👥" : "Mes Messages 💬"}
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.75)", margin: 0, fontSize: "0.95rem" }}>
                        {isMentor
                            ? "Tes conversations avec les étudiants que tu accompagnes."
                            : "Tes échanges avec tes mentors. Ils sont là pour toi !"}
                    </p>
                </div>
            </div>

            <div className="container container-sm" style={{ position: "relative", zIndex: 1 }}>
                {convs.length === 0 ? (
                    <div style={{
                        background: "#fff", borderRadius: "20px", padding: "3rem",
                        textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}>
                        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>{isMentor ? "👥" : "💬"}</div>
                        <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.5rem" }}>
                            {isMentor ? "Aucune demande pour l'instant" : "Aucune conversation"}
                        </div>
                        <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: 300, margin: "0 auto 1.25rem" }}>
                            {isMentor
                                ? "Sois patient, les étudiants pourront bientôt te contacter !"
                                : "Trouve un mentor et envoie-lui un message pour commencer."
                            }
                        </p>
                        {!isMentor && (
                            <Link to="/mentors" style={{
                                display: "inline-block",
                                padding: "0.65rem 1.5rem",
                                background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                                color: "#fff", fontWeight: 700, borderRadius: "12px", textDecoration: "none",
                            }}>
                                🤝 Trouver un mentor
                            </Link>
                        )}
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {convs.map((conv, idx) => {
                            const initial = (conv.other_user?.first_name?.[0] || "M").toUpperCase();
                            const avatarSrc = conv.other_user?.profile?.avatar_url;
                            const gradient = GRADIENTS[idx % GRADIENTS.length];
                            return (
                                <Link key={conv.id} to={`/chat/${conv.id}`} style={{ textDecoration: "none" }}>
                                    <div style={{
                                        background: "#fff",
                                        borderRadius: "16px",
                                        padding: "1rem 1.25rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem",
                                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                        border: "1px solid #f1f5f9",
                                        transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.15)"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "#f1f5f9"; }}
                                    >
                                        {/* Avatar */}
                                        <div style={{
                                            width: 48, height: 48, borderRadius: "50%",
                                            background: avatarSrc ? "transparent" : gradient,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontWeight: 800, color: "#fff", fontSize: "1.1rem", flexShrink: 0,
                                            overflow: "hidden",
                                        }}>
                                            {avatarSrc
                                                ? <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                : initial
                                            }
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                                                {conv.other_user?.first_name} {conv.other_user?.last_name}
                                            </div>
                                            {conv.last_message ? (
                                                <div style={{
                                                    fontSize: "0.85rem", color: "#64748b",
                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                }}>
                                                    {conv.last_message.content}
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>Aucun message encore</div>
                                            )}
                                        </div>

                                        {/* Date + arrow */}
                                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                                            <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.25rem" }}>
                                                {formatDate(conv.created_at)}
                                            </div>
                                            <div style={{ color: "#c7d2fe", fontSize: "1rem" }}>›</div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
