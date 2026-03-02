import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const REASONS = [
    {
        icon: "🌍", number: "01",
        title: "Une expérience personnelle",
        color: "linear-gradient(135deg, #1d4ed8, #6366f1)",
        text: "En tant qu'étudiant étranger au Québec, j'ai moi-même vécu la confusion et le stress liés à l'arrivée dans un nouveau système universitaire — l'incertitude sur les démarches, le manque d'infos centralisées, la différence de système d'enseignement.",
    },
    {
        icon: "🧠", number: "02",
        title: "Un problème réel et récurrent",
        color: "linear-gradient(135deg, #0369a1, #0ea5e9)",
        text: "Chaque année, des centaines d'étudiants arrivent avec les mêmes questions : Par quoi commencer ? Comment fonctionne la moyenne universitaire ? Comment éviter l'échec dès la première session ? Les infos existent, mais elles sont dispersées et peu adaptées.",
    },
    {
        icon: "📚", number: "03",
        title: "Un besoin d'accompagnement académique",
        color: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
        text: "Plusieurs étudiants échouent non pas par manque d'intelligence, mais par manque de compréhension du système : poids des examens, gestion du temps, méthodes d'étude adaptées au Québec. Ce projet vise à combler ce fossé.",
    },
    {
        icon: "🤝", number: "04",
        title: "L'importance du soutien humain",
        color: "linear-gradient(135deg, #059669, #10b981)",
        text: "L'isolement est réel. On hésite à poser des questions, on ne sait pas vers qui se tourner. C'est pourquoi NouveauDépart intègre une mise en relation avec des mentors expérimentés, une messagerie et un assistant IA disponible 24h/24.",
    },
];

const GOALS = [
    { icon: "🗂️", text: "Centraliser les informations essentielles" },
    { icon: "🧭", text: "Guider étape par étape dans les démarches" },
    { icon: "🎓", text: "Expliquer le fonctionnement universitaire" },
    { icon: "😌", text: "Réduire le stress lié à l'intégration" },
    { icon: "💪", text: "Favoriser l'autonomie et la réussite" },
    { icon: "🌟", text: "Offrir un accompagnement structuré" },
];

export default function Welcome() {
    const { user, loading } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 150);
        return () => clearTimeout(t);
    }, []);

    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const isMentor = user?.profile?.role === "mentor";
    const uniName = user?.profile?.university?.name;
    const avatarSrc = user?.profile?.avatar_url;
    const avatarLetter = (firstName[0] || user?.email?.[0] || "?").toUpperCase();
    const roleLabel = isMentor ? t("mentor") + " 🌟" : t("student") + " 🎓";
    const roleColor = isMentor
        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
        : "linear-gradient(135deg, #2563eb, #0ea5e9)";

    const hour = new Date().getHours();
    const greet = hour < 12 ? t("morning") : hour < 18 ? t("afternoon") : t("evening");

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>

            {/* ═══ HERO ═══ */}
            <div style={{
                background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #4338ca 100%)",
                padding: "4rem 2rem 5rem",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Blobs décoratifs */}
                <div style={{ position: "absolute", top: -120, left: -120, width: 400, height: 400, borderRadius: "50%", background: "rgba(99,102,241,0.15)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(139,92,246,0.12)", pointerEvents: "none" }} />

                {/* Contenu animé */}
                <div style={{
                    position: "relative", zIndex: 1,
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(28px)",
                    transition: "opacity 0.8s ease, transform 0.8s ease",
                }}>
                    {/* Avatar + Salut */}
                    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "0.85rem", marginBottom: "2rem" }}>

                        {/* Avatar circulaire */}
                        <div style={{
                            width: 88, height: 88, borderRadius: "50%",
                            background: avatarSrc ? "transparent" : roleColor,
                            border: "3px solid rgba(255,255,255,0.3)",
                            boxShadow: "0 0 0 7px rgba(255,255,255,0.07)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "2rem", fontWeight: 800, color: "#fff",
                            overflow: "hidden",
                        }}>
                            {avatarSrc
                                ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : avatarLetter}
                        </div>

                        {/* Texte de salutation */}
                        <div>
                            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginBottom: "0.25rem", letterSpacing: "0.04em" }}>
                                {greet} 👋
                            </div>
                            <div style={{
                                color: "#fff",
                                fontSize: fullName ? "clamp(1.6rem,4vw,2.3rem)" : "1.4rem",
                                fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1,
                                marginBottom: "0.55rem",
                            }}>
                                {fullName ? `${fullName} 🍁` : t("welcome")}
                            </div>
                            {/* Badge rôle */}
                            {!loading && (
                                <div style={{
                                    display: "inline-block", background: roleColor,
                                    borderRadius: "999px", padding: "0.28rem 0.9rem",
                                    color: "#fff", fontSize: "0.78rem", fontWeight: 700,
                                    marginBottom: uniName ? "0.45rem" : 0,
                                }}>
                                    {roleLabel}
                                </div>
                            )}
                            {uniName && (
                                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.83rem", marginTop: "0.3rem" }}>
                                    🏫 {uniName}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Titre projet */}
                    <h1 style={{
                        fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, color: "#fff",
                        letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "1rem",
                    }}>
                        Nouveau<span style={{ color: "#a78bfa" }}>Départ</span>
                    </h1>

                    <p style={{
                        fontSize: "clamp(0.95rem,2vw,1.15rem)", color: "rgba(255,255,255,0.7)",
                        maxWidth: 560, margin: "0 auto 2.25rem", lineHeight: 1.75, fontStyle: "italic",
                    }}>
                        « Un outil centré sur l'humain, développé dans un cadre académique,
                        mais inspiré d'une expérience réelle. »
                    </p>

                    {/* CTA principal */}
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            color: "#fff", border: "none",
                            padding: "0.95rem 2.5rem",
                            borderRadius: "14px", fontSize: "1rem", fontWeight: 700,
                            cursor: "pointer", boxShadow: "0 8px 32px rgba(99,102,241,0.45)",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(99,102,241,0.55)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.45)"; }}
                    >
                        {t("go_to_dashboard")} →
                    </button>

                    <div style={{ marginTop: "1rem", color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>
                        ↓ {t("discover_story")}
                    </div>
                </div>
            </div>

            {/* ═══ POURQUOI CE PROJET ═══ */}
            <div style={{ maxWidth: 860, margin: "0 auto", padding: "4rem 2rem 2rem" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <div style={{
                        display: "inline-block",
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        borderRadius: "999px", padding: "0.35rem 1.1rem",
                        color: "#fff", fontSize: "0.78rem", fontWeight: 700,
                        marginBottom: "0.85rem", letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>
                        {t("why_this_project")}
                    </div>
                    <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.65rem" }}>
                        {t("what_pushed_me")}
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "1rem", maxWidth: 580, margin: "0 auto", lineHeight: 1.7 }}>
                        Ce projet est né d'un vécu personnel, d'une frustration réelle,
                        et d'une envie sincère d'aider ceux qui vivent ce que j'ai vécu.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {REASONS.map((r, i) => (
                        <div key={r.number} style={{
                            display: "flex", gap: "1.25rem", alignItems: "flex-start",
                            background: "#fff", borderRadius: "20px", padding: "1.75rem",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateX(0)" : "translateX(-16px)",
                            transition: `opacity 0.6s ease ${0.2 + i * 0.1}s, transform 0.6s ease ${0.2 + i * 0.1}s`,
                        }}>
                            <div style={{
                                flexShrink: 0, width: 60, height: 60, borderRadius: "16px",
                                background: r.color, display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                            }}>
                                <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{r.icon}</span>
                                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.6rem", fontWeight: 700, marginTop: 2 }}>{r.number}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.4rem" }}>{r.title}</h3>
                                <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: "0.93rem", margin: 0 }}>{r.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ OBJECTIFS ═══ */}
            <div style={{ background: "linear-gradient(160deg,#1e1b4b,#312e81,#4338ca)", padding: "4rem 2rem", marginTop: "2rem" }}>
                <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
                    <div style={{
                        display: "inline-block", background: "rgba(255,255,255,0.15)",
                        borderRadius: "999px", padding: "0.35rem 1.1rem",
                        color: "#c7d2fe", fontSize: "0.78rem", fontWeight: 700,
                        marginBottom: "0.85rem", letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>
                        🎓 {t("project_goal")}
                    </div>
                    <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", fontWeight: 800, color: "#fff", marginBottom: "0.65rem", letterSpacing: "-0.03em" }}>
                        {t("aim_to_accomplish")}
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", marginBottom: "2.25rem" }}>
                        Une vision globale centrée sur l'humain, pas seulement sur l'information.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: "0.85rem", textAlign: "left" }}>
                        {GOALS.map((g) => (
                            <div key={g.text} style={{
                                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
                                borderRadius: "14px", padding: "1.1rem 1.35rem",
                                display: "flex", alignItems: "center", gap: "0.8rem",
                                color: "#fff", transition: "background 0.2s",
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                            >
                                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{g.icon}</span>
                                <span style={{ fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.4 }}>{g.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ VISION + CTA ═══ */}
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "4rem 2rem", textAlign: "center" }}>
                <div style={{
                    background: "#fff", borderRadius: "24px", padding: "2.75rem 2.25rem",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9",
                }}>
                    <div style={{ fontSize: "2.8rem", marginBottom: "0.85rem" }}>💡</div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.85rem", letterSpacing: "-0.03em" }}>
                        {t("global_vision")}
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "0.98rem", lineHeight: 1.85, marginBottom: "1.85rem" }}>
                        Ce projet ne vise pas uniquement à fournir de l'information.<br />
                        Il vise à <strong style={{ color: "#6366f1" }}>rassurer</strong>,{" "}
                        <strong style={{ color: "#0ea5e9" }}>structurer</strong>,{" "}
                        <strong style={{ color: "#8b5cf6" }}>accompagner</strong>{" "}
                        et <strong style={{ color: "#059669" }}>faciliter</strong> l'intégration académique
                        et sociale des étudiants internationaux au Québec.
                    </p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            background: "linear-gradient(135deg,#4338ca,#6366f1)",
                            color: "#fff", border: "none",
                            padding: "0.95rem 2.5rem",
                            borderRadius: "14px", fontSize: "1rem", fontWeight: 700,
                            cursor: "pointer", boxShadow: "0 6px 24px rgba(99,102,241,0.35)",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(99,102,241,0.5)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.35)"; }}
                    >
                        🚀 {t("start_adventure")}
                    </button>
                </div>
            </div>

        </div>
    );
}
