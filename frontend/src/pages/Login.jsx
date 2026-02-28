import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
    { icon: "🏔️", title: "Guide complet", desc: "Toutes les étapes pour t'installer au Québec" },
    { icon: "🤝", title: "Mentors dédiés", desc: "Des étudiants expérimentés pour t'accompagner" },
    { icon: "🤖", title: "Assistant IA", desc: "Répond à tes questions 24h/24" },
];

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            await refreshUser(); // charge le profil avant d'afficher Welcome
            navigate("/welcome");
        } catch (err) {
            setError(err.response?.data?.detail || "Identifiants invalides.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Left panel — branding */}
            <div style={{
                flex: "0 0 42%",
                background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "3rem 3rem",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Decorative blobs */}
                <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(139,92,246,0.25)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(99,102,241,0.2)", pointerEvents: "none" }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                    {/* Logo */}
                    <div style={{ marginBottom: "3rem" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "0.3rem" }}>🍁</div>
                        <div style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.03em" }}>
                            Nouveau<span style={{ color: "#a78bfa" }}>Départ</span>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                            Ton guide d'intégration au Québec
                        </div>
                    </div>

                    {/* Features */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {FEATURES.map((f) => (
                            <div key={f.title} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: "12px", flexShrink: 0,
                                    background: "rgba(255,255,255,0.12)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.3rem",
                                }}>
                                    {f.icon}
                                </div>
                                <div>
                                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>{f.title}</div>
                                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", marginTop: "0.2rem" }}>{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: "3rem", color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>
                        © 2026 NouveauDépart · Fait avec ❤️ au Québec
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div style={{
                flex: 1,
                background: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
            }}>
                <div style={{ width: "100%", maxWidth: 420 }}>
                    <div style={{ marginBottom: "2rem" }}>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.4rem" }}>
                            Bon retour ! 👋
                        </h1>
                        <p style={{ color: "#64748b", fontSize: "0.92rem" }}>
                            Connecte-toi pour continuer ton aventure
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            background: "#fef2f2", border: "1px solid #fecaca",
                            borderRadius: "12px", padding: "0.85rem 1rem",
                            color: "#dc2626", fontSize: "0.88rem", marginBottom: "1.25rem",
                            display: "flex", alignItems: "center", gap: "0.5rem",
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate autoComplete="off">
                        <div style={{ marginBottom: "1.1rem" }}>
                            <label htmlFor="login-email" style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: "#374151", marginBottom: "0.4rem" }}>
                                Adresse courriel
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="off"
                                autoFocus
                                placeholder="ton@courriel.com"
                                style={{
                                    width: "100%", padding: "0.8rem 1rem",
                                    border: "1.5px solid #e2e8f0", borderRadius: "12px",
                                    fontSize: "0.95rem", outline: "none",
                                    transition: "border-color 0.2s, box-shadow 0.2s",
                                    boxSizing: "border-box",
                                    background: "#fff",
                                }}
                                onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                            />
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label htmlFor="login-password" style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: "#374151", marginBottom: "0.4rem" }}>
                                Mot de passe
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    style={{
                                        width: "100%", padding: "0.8rem 3rem 0.8rem 1rem",
                                        border: "1.5px solid #e2e8f0", borderRadius: "12px",
                                        fontSize: "0.95rem", outline: "none",
                                        transition: "border-color 0.2s, box-shadow 0.2s",
                                        boxSizing: "border-box",
                                        background: "#fff",
                                    }}
                                    onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                    position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", cursor: "pointer", fontSize: "1rem",
                                    color: "#94a3b8",
                                }}>
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "0.9rem",
                                borderRadius: "12px",
                                background: loading ? "#94a3b8" : "linear-gradient(135deg, #4338ca, #6366f1)",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "1rem",
                                border: "none",
                                cursor: loading ? "not-allowed" : "pointer",
                                boxShadow: loading ? "none" : "0 4px 16px rgba(99,102,241,0.35)",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            {loading ? "Connexion…" : "Se connecter →"}
                        </button>
                    </form>

                    <div style={{ textAlign: "center", marginTop: "1.5rem", color: "#64748b", fontSize: "0.88rem" }}>
                        Pas encore de compte ?{" "}
                        <Link to="/register" style={{ color: "#6366f1", fontWeight: 700, textDecoration: "none" }}>
                            S'inscrire gratuitement
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
