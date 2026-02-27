import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/auth";

const STEPS = ["🌍 Étudiant international", "🎓 Arrivée au Québec", "🏠 Installation réussie"];

export default function Register() {
    const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear field error when user types
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }
    }

    function handleBlur(e) {
        setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    }

    function validate() {
        const errors = {};
        if (!form.first_name.trim()) errors.first_name = "Le prénom est obligatoire";
        if (!form.last_name.trim()) errors.last_name = "Le nom est obligatoire";
        if (!form.email.trim()) errors.email = "Le courriel est obligatoire";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Courriel invalide";
        if (!form.password) errors.password = "Le mot de passe est obligatoire";
        else if (form.password.length < 6) errors.password = "Minimum 6 caractères";
        return errors;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        // Mark all fields as touched
        setTouched({ first_name: true, last_name: true, email: true, password: true });
        // Client-side validation
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        setLoading(true);
        try {
            await register(form);
            navigate("/onboarding");
        } catch (err) {
            const data = err.response?.data;
            if (data) {
                const msgs = Object.values(data).flat().join(" ");
                setError(msgs);
            } else {
                setError("Erreur lors de l'inscription.");
            }
            // Clear all fields on failed server attempt
            setForm({ first_name: "", last_name: "", email: "", password: "" });
            setTouched({});
            setFieldErrors({});
        } finally {
            setLoading(false);
        }
    }

    const getInputStyle = (fieldName) => ({
        width: "100%", padding: "0.8rem 1rem",
        border: `1.5px solid ${fieldErrors[fieldName] ? "#ef4444" : "#e2e8f0"}`,
        borderRadius: "12px",
        fontSize: "0.95rem", outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxSizing: "border-box",
        background: fieldErrors[fieldName] ? "#fef2f2" : "#fff",
    });
    const focusIn = (e) => { e.target.style.borderColor = fieldErrors[e.target.name] ? "#ef4444" : "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; };
    const focusOut = (e) => { e.target.style.borderColor = fieldErrors[e.target.name] ? "#ef4444" : "#e2e8f0"; e.target.style.boxShadow = "none"; };

    function FieldError({ name }) {
        return fieldErrors[name] ? (
            <div style={{ fontSize: "0.78rem", color: "#ef4444", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                ⚠️ {fieldErrors[name]}
            </div>
        ) : null;
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Left panel — branding */}
            <div style={{
                flex: "0 0 42%",
                background: "linear-gradient(160deg, #0c4a6e 0%, #0369a1 40%, #0ea5e9 80%, #38bdf8 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "3rem",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(56,189,248,0.2)" }} />
                <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(14,165,233,0.25)" }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ marginBottom: "2.5rem" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "0.3rem" }}>🍁</div>
                        <div style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.03em" }}>
                            Nouveau<span style={{ color: "#bae6fd" }}>Départ</span>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                            Rejoins la communauté dès aujourd'hui
                        </div>
                    </div>

                    {/* Journey steps */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                        {STEPS.map((step, i) => (
                            <div key={step} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%",
                                        background: "rgba(255,255,255,0.2)",
                                        border: "2px solid rgba(255,255,255,0.4)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.8rem", fontWeight: 800, color: "#fff",
                                        flexShrink: 0,
                                    }}>
                                        {i + 1}
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div style={{ width: 2, flex: 1, minHeight: 28, background: "rgba(255,255,255,0.2)", margin: "4px 0" }} />
                                    )}
                                </div>
                                <div style={{ paddingTop: "0.45rem", paddingBottom: i < STEPS.length - 1 ? "1.25rem" : 0 }}>
                                    <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.92rem" }}>{step}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: "2.5rem",
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "14px",
                        padding: "1rem 1.25rem",
                        color: "rgba(255,255,255,0.85)",
                        fontSize: "0.85rem",
                        lineHeight: 1.6,
                    }}>
                        💡 Inscription en moins de 30 secondes, <strong>100% gratuit</strong>, aucune carte requise.
                    </div>

                    <div style={{ marginTop: "2rem", color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>
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
                <div style={{ width: "100%", maxWidth: 440 }}>
                    <div style={{ marginBottom: "1.75rem" }}>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.4rem" }}>
                            Créer mon compte 🚀
                        </h1>
                        <p style={{ color: "#64748b", fontSize: "0.92rem" }}>
                            Commence ton aventure québécoise
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
                        {/* Name row */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginBottom: "1rem" }}>
                            <div>
                                <label htmlFor="reg-firstname" style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: "#374151", marginBottom: "0.4rem" }}>
                                    Prénom <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input id="reg-firstname" name="first_name" type="text" style={getInputStyle("first_name")}
                                    value={form.first_name} onChange={handleChange}
                                    placeholder="Jean" autoComplete="off" onFocus={focusIn}
                                    onBlur={(e) => { handleBlur(e); focusOut(e); }} />
                                <FieldError name="first_name" />
                            </div>
                            <div>
                                <label htmlFor="reg-lastname" style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: "#374151", marginBottom: "0.4rem" }}>
                                    Nom <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input id="reg-lastname" name="last_name" type="text" style={getInputStyle("last_name")}
                                    value={form.last_name} onChange={handleChange}
                                    placeholder="Tremblay" autoComplete="off" onFocus={focusIn}
                                    onBlur={(e) => { handleBlur(e); focusOut(e); }} />
                                <FieldError name="last_name" />
                            </div>
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <label htmlFor="reg-email" style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: "#374151", marginBottom: "0.4rem" }}>
                                Adresse courriel <span style={{ color: "#ef4444" }}>*</span>
                            </label>
                            <input id="reg-email" name="email" type="email" style={getInputStyle("email")}
                                value={form.email} onChange={handleChange} onBlur={handleBlur}
                                autoComplete="off"
                                placeholder="ton@courriel.com" onFocus={focusIn} />
                            <FieldError name="email" />
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label htmlFor="reg-password" style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: "#374151", marginBottom: "0.4rem" }}>
                                Mot de passe <span style={{ color: "#ef4444" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <input id="reg-password" name="password" type={showPassword ? "text" : "password"}
                                    style={{ ...getInputStyle("password"), paddingRight: "3rem" }}
                                    value={form.password} onChange={handleChange}
                                    placeholder="Min. 6 caractères" minLength={6}
                                    autoComplete="new-password"
                                    onFocus={focusIn}
                                    onBlur={(e) => { handleBlur(e); focusOut(e); }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                    position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#94a3b8",
                                }}>
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                            <FieldError name="password" />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "0.9rem",
                                borderRadius: "12px",
                                background: loading ? "#94a3b8" : "linear-gradient(135deg, #0369a1, #0ea5e9)",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "1rem",
                                border: "none",
                                cursor: loading ? "not-allowed" : "pointer",
                                boxShadow: loading ? "none" : "0 4px 16px rgba(14,165,233,0.35)",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            {loading ? "Création du compte…" : "Créer mon compte →"}
                        </button>
                    </form>

                    <div style={{ textAlign: "center", marginTop: "1.5rem", color: "#64748b", fontSize: "0.88rem" }}>
                        Déjà un compte ?{" "}
                        <Link to="/login" style={{ color: "#0ea5e9", fontWeight: 700, textDecoration: "none" }}>
                            Se connecter
                        </Link>
                    </div>

                    <div style={{ textAlign: "center", marginTop: "1rem", color: "#94a3b8", fontSize: "0.75rem" }}>
                        En créant un compte, tu acceptes nos conditions d'utilisation
                    </div>
                </div>
            </div>
        </div>
    );
}
