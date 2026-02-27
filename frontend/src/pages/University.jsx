import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const RESOURCE_ICONS = {
    registrariat: "🏛️", bibliotheque: "📚", crous: "🍽️", accueil: "🤝",
    sante: "🏥", international: "🌍", transport: "🚌", logement: "🏠",
    defaut: "🔗",
};

function getIcon(key) {
    const lower = key.toLowerCase();
    for (const [k, icon] of Object.entries(RESOURCE_ICONS)) {
        if (lower.includes(k)) return icon;
    }
    return RESOURCE_ICONS.defaut;
}

export default function University() {
    const { id } = useParams();
    const { user } = useAuth();
    const [uni, setUni] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/universities/${id}/`).then((res) => setUni(res.data)).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="page-content"><div className="spinner" /></div>;
    if (!uni) return (
        <div className="page-content"><div className="container">
            <div style={{ textAlign: "center", padding: "4rem 0", color: "#64748b" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Université introuvable</div>
            </div>
        </div></div>
    );

    const resources = uni.resources_json || {};
    const isMentor = user?.profile?.role === "mentor";
    const heroBg = isMentor
        ? "linear-gradient(135deg, #1e1b4b, #312e81, #6366f1)"
        : "linear-gradient(135deg, #0c4a6e, #1d4ed8, #2563eb)";

    return (
        <div className="page-content" style={{ background: "linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%)", minHeight: "100vh" }}>
            {/* Hero */}
            <div style={{
                background: heroBg,
                padding: "2.5rem 0 4.5rem",
                marginBottom: "-2.5rem",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{ position: "absolute", top: -50, right: -50, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -40, left: "15%", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

                <div className="container container-sm">
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: "20px",
                            background: "rgba(255,255,255,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "2rem", flexShrink: 0,
                            border: "1px solid rgba(255,255,255,0.2)",
                        }}>🎓</div>
                        <div>
                            <div style={{
                                display: "inline-block",
                                background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)",
                                borderRadius: "999px", padding: "0.2rem 0.8rem",
                                fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                                marginBottom: "0.4rem",
                            }}>
                                Mon université
                            </div>
                            <h1 style={{ color: "#fff", marginBottom: "0.3rem", fontSize: "1.6rem" }}>{uni.name}</h1>
                            <div style={{ color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                                <span>📍</span> <span>{uni.city}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container container-sm" style={{ position: "relative", zIndex: 1 }}>
                {/* Website card */}
                <div style={{
                    background: "#fff", borderRadius: "20px", padding: "1.5rem",
                    marginBottom: "1.25rem",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: "14px",
                            background: "linear-gradient(135deg, #dbeafe, #e0e7ff)",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem",
                        }}>🌐</div>
                        <div>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>Site officiel</div>
                            <div style={{ fontSize: "0.82rem", color: "#64748b" }}>Portail principal de l'université</div>
                        </div>
                    </div>
                    {uni.website_url ? (
                        <a href={uni.website_url} target="_blank" rel="noopener noreferrer" style={{
                            padding: "0.6rem 1.2rem", borderRadius: "12px",
                            background: isMentor ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                            color: "#fff", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none",
                            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                            transition: "opacity 0.2s",
                        }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >
                            Visiter le site →
                        </a>
                    ) : (
                        <span style={{ color: "#94a3b8", fontSize: "0.88rem" }}>Non renseigné</span>
                    )}
                </div>

                {/* Resources */}
                {Object.keys(resources).length > 0 && (
                    <>
                        <h3 style={{ marginBottom: "1rem", fontSize: "1.05rem", fontWeight: 700 }}>
                            🔖 Ressources clés
                        </h3>
                        <div className="grid grid-2" style={{ marginBottom: "1.5rem" }}>
                            {Object.entries(resources).map(([key, val]) => (
                                <div key={key} style={{
                                    background: "#fff",
                                    borderRadius: "16px",
                                    padding: "1.1rem 1.25rem",
                                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                    border: "1px solid #f1f5f9",
                                    display: "flex", alignItems: "flex-start", gap: "0.85rem",
                                    transition: "transform 0.15s, border-color 0.15s",
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#f1f5f9"; }}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
                                        background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
                                    }}>
                                        {getIcon(key)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", marginBottom: "0.25rem" }}>
                                            {key.replace(/_/g, " ")}
                                        </div>
                                        {String(val).startsWith("http") ? (
                                            <a href={val} target="_blank" rel="noopener noreferrer" style={{
                                                fontSize: "0.88rem", color: isMentor ? "#6366f1" : "#2563eb", fontWeight: 600,
                                                textDecoration: "none",
                                            }}>
                                                Accéder →
                                            </a>
                                        ) : (
                                            <span style={{ fontSize: "0.88rem", color: "#0f172a" }}>{val}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Back */}
                <Link to="/dashboard" style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    color: "#64748b", fontSize: "0.88rem", textDecoration: "none", fontWeight: 600,
                    padding: "0.5rem 0",
                    transition: "color 0.15s",
                }}
                    onMouseEnter={e => e.currentTarget.style.color = isMentor ? "#6366f1" : "#2563eb"}
                    onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
                >
                    ← Retour au tableau de bord
                </Link>
            </div>
        </div>
    );
}
