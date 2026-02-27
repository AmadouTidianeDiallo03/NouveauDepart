import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProgressBar from "../components/ProgressBar";

/* ─── Mentor Action Card ─── */
function ActionCard({ to, icon, title, desc, gradient }) {
    return (
        <Link to={to} style={{ textDecoration: "none" }}>
            <div style={{
                background: gradient,
                borderRadius: "20px",
                padding: "1.75rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                height: "100%",
                minHeight: "160px",
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.18)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
                }}
            >
                <div style={{ fontSize: "2.5rem", lineHeight: 1 }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}>{title}</div>
                <div style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{desc}</div>
            </div>
        </Link>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/guides/progress/")
            .then((p) => setProgress(p.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="page-content"><div className="spinner" /></div>;

    const isMentor = user?.profile?.role === "mentor";
    const firstName = user?.first_name || (isMentor ? "Mentor" : "étudiant·e");
    const lastName = user?.last_name || "";
    const uniName = user?.profile?.university?.name || "";
    const avatarLetter = firstName?.[0]?.toUpperCase() || "M";

    /* ─── MENTOR VIEW ─── */
    if (isMentor) {
        return (
            <div className="page-content">
                {/* Hero Banner */}
                <div style={{
                    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)",
                    padding: "3rem 0 5rem",
                    marginBottom: "-3rem",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    {/* Decorative blobs */}
                    <div style={{
                        position: "absolute", top: "-60px", right: "-60px",
                        width: "320px", height: "320px", borderRadius: "50%",
                        background: "rgba(139,92,246,0.25)", pointerEvents: "none",
                    }} />
                    <div style={{
                        position: "absolute", bottom: "-80px", left: "10%",
                        width: "200px", height: "200px", borderRadius: "50%",
                        background: "rgba(99,102,241,0.3)", pointerEvents: "none",
                    }} />

                    <div className="container">
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                            {/* Avatar */}
                            <div style={{
                                width: 80, height: 80, borderRadius: "50%",
                                background: "linear-gradient(135deg, #a78bfa, #818cf8)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "2rem", fontWeight: 800, color: "#fff",
                                boxShadow: "0 0 0 4px rgba(255,255,255,0.2)",
                                flexShrink: 0,
                            }}>
                                {avatarLetter}
                            </div>
                            <div>
                                <div style={{
                                    display: "inline-block",
                                    background: "rgba(255,255,255,0.15)",
                                    color: "#c4b5fd",
                                    borderRadius: "999px",
                                    padding: "0.2rem 0.85rem",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    marginBottom: "0.5rem",
                                }}>
                                    ⭐ Mentor Certifié
                                </div>
                                <h1 style={{ color: "#fff", marginBottom: "0.25rem" }}>
                                    Bonjour, {firstName} {lastName} !
                                </h1>
                                {uniName && (
                                    <p style={{ color: "#c4b5fd", margin: 0, fontSize: "0.95rem" }}>
                                        🎓 {uniName}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container" style={{ position: "relative", zIndex: 1 }}>
                    {/* Mission Card */}
                    <div style={{
                        background: "#fff",
                        borderRadius: "20px",
                        padding: "1.5rem 2rem",
                        marginBottom: "2rem",
                        boxShadow: "0 8px 32px rgba(99,102,241,0.12)",
                        borderLeft: "5px solid #6366f1",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        flexWrap: "wrap",
                    }}>
                        <div style={{ fontSize: "2.5rem" }}>🌟</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1e1b4b" }}>Ta mission en tant que Mentor</div>
                            <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                                Accompagner les nouveaux arrivants dans leur intégration universitaire et sociale au Québec.
                            </div>
                        </div>
                    </div>

                    {/* Action Grid */}
                    <h2 style={{ marginBottom: "1.25rem", fontSize: "1.3rem" }}>Espace Mentor</h2>
                    <div className="grid grid-3" style={{ marginBottom: "2rem" }}>
                        <ActionCard
                            to="/conversations"
                            icon="💬"
                            title="Mes Mentorés"
                            desc="Consulte et réponds à tes étudiants"
                            gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
                        />
                        <ActionCard
                            to="/onboarding"
                            icon="🪪"
                            title="Mon Profil"
                            desc="Mets à jour ta bio, université et langue"
                            gradient="linear-gradient(135deg, #0ea5e9, #6366f1)"
                        />
                        <ActionCard
                            to="/assistant"
                            icon="🤖"
                            title="Assistant IA"
                            desc="Prépare tes conseils avec l'IA"
                            gradient="linear-gradient(135deg, #10b981, #0ea5e9)"
                        />
                    </div>

                    {/* Secondary row */}
                    <div className="grid grid-3">
                        <ActionCard
                            to="/glossary"
                            icon="📖"
                            title="Glossaire"
                            desc="Aide les étudiants avec les termes locaux"
                            gradient="linear-gradient(135deg, #f59e0b, #ef4444)"
                        />
                        {user?.profile?.university && (
                            <ActionCard
                                to={`/university/${user.profile.university.id}`}
                                icon="🎓"
                                title="Mon Université"
                                desc="Ressources et infos de ton campus"
                                gradient="linear-gradient(135deg, #ec4899, #8b5cf6)"
                            />
                        )}
                        <ActionCard
                            to="/study-success"
                            icon="📚"
                            title="Réussite Académique"
                            desc="Conseils pour aider tes mentorés"
                            gradient="linear-gradient(135deg, #14b8a6, #3b82f6)"
                        />
                    </div>

                    {/* Tips */}
                    <div style={{
                        background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                        border: "1px solid #bae6fd",
                        borderRadius: "16px",
                        padding: "1.25rem 1.5rem",
                        marginTop: "2rem",
                        display: "flex",
                        gap: "1rem",
                        alignItems: "flex-start",
                    }}>
                        <div style={{ fontSize: "1.75rem", flexShrink: 0 }}>💡</div>
                        <div>
                            <div style={{ fontWeight: 700, color: "#0369a1", marginBottom: "0.3rem" }}>Conseil du jour</div>
                            <div style={{ color: "#0c4a6e", fontSize: "0.9rem", lineHeight: 1.6 }}>
                                Un message de bienvenue personnalisé peut faire toute la différence pour un nouvel arrivant.
                                Parle de ton expérience et montre que tu es là pour eux ! 💪
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ─── STUDENT VIEW ─── */
    const pct = progress ? Math.round((progress.done_tasks / Math.max(progress.total_tasks, 1)) * 100) : 0;

    return (
        <div className="page-content" style={{ background: "linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%)", minHeight: "100vh" }}>
            {/* Hero Banner */}
            <div style={{
                background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #2563eb 100%)",
                padding: "2.5rem 0 5rem",
                marginBottom: "-3rem",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{ position: "absolute", top: -50, right: -50, width: 280, height: 280, borderRadius: "50%", background: "rgba(99,102,241,0.25)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -60, left: "15%", width: 180, height: 180, borderRadius: "50%", background: "rgba(59,130,246,0.2)", pointerEvents: "none" }} />

                <div className="container">
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                        {/* Avatar */}
                        <div style={{
                            width: 72, height: 72, borderRadius: "50%",
                            background: "linear-gradient(135deg, #60a5fa, #818cf8)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.8rem", fontWeight: 800, color: "#fff",
                            boxShadow: "0 0 0 4px rgba(255,255,255,0.2)",
                            flexShrink: 0,
                        }}>
                            {(firstName?.[0] || "É").toUpperCase()}
                        </div>
                        <div>
                            <div style={{
                                display: "inline-block",
                                background: "rgba(255,255,255,0.15)", color: "#bfdbfe",
                                borderRadius: "999px", padding: "0.2rem 0.85rem",
                                fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                                marginBottom: "0.4rem",
                            }}>
                                🌟 Nouvel arrivant
                            </div>
                            <h1 style={{ color: "#fff", marginBottom: "0.2rem" }}>Bonjour, {firstName} ! 👋</h1>
                            {uniName && <p style={{ color: "#93c5fd", margin: 0, fontSize: "0.9rem" }}>🎓 {uniName}</p>}
                        </div>

                        {/* Progress ring */}
                        {progress && (
                            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{
                                    width: 68, height: 68, borderRadius: "50%",
                                    background: `conic-gradient(#60a5fa ${pct * 3.6}deg, rgba(255,255,255,0.15) 0deg)`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: "50%",
                                        background: "rgba(30,58,95,0.9)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "#fff", fontWeight: 800, fontSize: "0.95rem",
                                    }}>
                                        {pct}%
                                    </div>
                                </div>
                                <div style={{ display: "none" }} className="md-show">
                                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>{progress.done_tasks}/{progress.total_tasks}</div>
                                    <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.78rem" }}>tâches complétées</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container" style={{ position: "relative", zIndex: 1 }}>
                {/* Progress breakdown */}
                {progress?.by_category && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
                        {progress.by_category.map((cat) => (
                            <div key={cat.step_id} style={{
                                background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px",
                                padding: "0.65rem 1.1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                flex: "1 1 150px",
                            }}>
                                <div style={{ fontWeight: 800, color: "#1d4ed8", fontSize: "1.25rem" }}>{cat.done}/{cat.total}</div>
                                <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>{cat.title}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Access */}
                <h2 style={{ marginBottom: "1.25rem", fontSize: "1.2rem" }}>Accès rapide</h2>
                <div className="grid grid-3">
                    <ActionCard to="/checklist" icon="✅" title="Ma Checklist" desc="Étapes et tâches à compléter" gradient="linear-gradient(135deg, #1d4ed8, #6366f1)" />
                    <ActionCard to="/mentors" icon="🤝" title="Trouver un mentor" desc="Des étudiants expérimentés prêts à t'aider" gradient="linear-gradient(135deg, #059669, #0ea5e9)" />
                    <ActionCard to="/study-success" icon="📚" title="Réussite académique" desc="Crédits, évaluations, méthodes" gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" />
                    <ActionCard to="/assistant" icon="🤖" title="Assistant IA" desc="Pose une question en FR ou EN" gradient="linear-gradient(135deg, #8b5cf6, #ec4899)" />
                    <ActionCard to="/glossary" icon="📖" title="Glossaire" desc="Dictionnaire des termes québécois" gradient="linear-gradient(135deg, #7c3aed, #6366f1)" />
                    {user?.profile?.university && (
                        <ActionCard to={`/university/${user.profile.university.id}`} icon="🎓" title="Mon université" desc="Infos clés et ressources" gradient="linear-gradient(135deg, #0369a1, #0ea5e9)" />
                    )}
                    <ActionCard to="/conversations" icon="💬" title="Messages" desc="Tes conversations avec les mentors" gradient="linear-gradient(135deg, #0ea5e9, #2563eb)" />
                </div>
            </div>
        </div>
    );
}
