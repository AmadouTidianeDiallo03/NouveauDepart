import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { updateMe } from "../services/auth";
import { useAuth } from "../context/AuthContext";

export default function Onboarding() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [universities, setUniversities] = useState([]);
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        role: "newcomer",
        university_id: "",
        city: "",
        language: "fr",
        bio: "",
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/universities/").then((res) => setUniversities(res.data.results || res.data));
        if (user) {
            setForm({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                role: user.profile?.role || "newcomer",
                university_id: user.profile?.university?.id ? String(user.profile.university.id) : "",
                city: user.profile?.city || "",
                language: user.profile?.language || "fr",
                bio: user.profile?.bio || "",
            });
            if (user.profile?.avatar_url) setAvatarPreview(user.profile.avatar_url);
        }
    }, [user]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (name === "university_id") {
            const uni = universities.find((u) => String(u.id) === value);
            if (uni) setForm((f) => ({ ...f, university_id: value, city: uni.city }));
        }
    }

    function handleAvatarChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (avatarFile) {
                const fd = new FormData();
                fd.append("avatar", avatarFile);
                fd.append("first_name", form.first_name);
                fd.append("last_name", form.last_name);
                await api.patch("/auth/me", fd, { headers: { "Content-Type": "multipart/form-data" } });
            }
            await updateMe({
                first_name: form.first_name,
                last_name: form.last_name,
                profile: {
                    role: form.role,
                    university_id: form.university_id || null,
                    city: form.city,
                    language: form.language,
                    bio: form.bio,
                    onboarding_done: true,
                },
            });
            await refreshUser();
            setSuccess(true);
            setTimeout(() => navigate("/welcome"), 1200);
        } catch (err) {
            setError("Erreur lors de la sauvegarde. Réessaye.");
        } finally {
            setLoading(false);
        }
    }

    const isMentor = form.role === "mentor";
    const accentGrad = isMentor
        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
        : "linear-gradient(135deg, #2563eb, #0ea5e9)";
    const heroGrad = isMentor
        ? "linear-gradient(135deg, #1e1b4b, #4338ca)"
        : "linear-gradient(135deg, #1d4ed8, #2563eb)";
    const avatarLetter = (form.first_name?.[0] || user?.email?.[0] || "U").toUpperCase();

    /* ─── Shared styles ─── */
    const field = {
        width: "100%", padding: "0.8rem 1rem",
        border: "1.5px solid #e2e8f0", borderRadius: "12px",
        fontSize: "0.95rem", outline: "none",
        background: "#fff", color: "#0f172a",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxSizing: "border-box",
        fontFamily: "inherit",
    };
    const label = {
        display: "block", fontWeight: 700,
        fontSize: "0.85rem", color: "#374151", marginBottom: "0.4rem",
    };
    const grp = { marginBottom: "1rem" };
    const card = {
        background: "#fff", borderRadius: "20px",
        padding: "1.75rem", marginBottom: "1.25rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        border: "1px solid #f1f5f9",
    };
    const focusIn = (e) => {
        e.target.style.borderColor = isMentor ? "#6366f1" : "#2563eb";
        e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
    };
    const focusOut = (e) => {
        e.target.style.borderColor = "#e2e8f0";
        e.target.style.boxShadow = "none";
    };

    return (
        <div style={{ background: "linear-gradient(160deg,#f0f4ff,#f8fafc)", minHeight: "100vh", paddingBottom: "3rem" }}>
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.25rem" }}>

                {/* ── Header ── */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{
                        display: "inline-block", background: accentGrad,
                        borderRadius: "999px", padding: "0.35rem 1.1rem",
                        color: "#fff", fontSize: "0.78rem", fontWeight: 700,
                        marginBottom: "0.85rem", letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>
                        {isMentor ? "Profil Mentor 🌟" : "Profil Étudiant 🎓"}
                    </div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.4rem", letterSpacing: "-0.03em" }}>
                        Complète ton profil
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
                        {isMentor
                            ? "Personnalise ton profil pour inspirer confiance aux étudiants."
                            : "Une expérience personnalisée t'attend — dis-nous qui tu es !"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} autoComplete="off">

                    {/* ── Avatar hero card ── */}
                    <div style={{ background: heroGrad, borderRadius: "24px", padding: "2rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                        <div style={{ position: "relative", cursor: "pointer", flexShrink: 0 }} onClick={() => fileInputRef.current.click()}>
                            <div style={{
                                width: 100, height: 100, borderRadius: "50%",
                                background: avatarPreview ? "transparent" : "rgba(255,255,255,0.2)",
                                border: "3px solid rgba(255,255,255,0.5)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "2.5rem", fontWeight: 800, color: "#fff",
                                overflow: "hidden", transition: "transform 0.2s",
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                            >
                                {avatarPreview
                                    ? <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : avatarLetter}
                            </div>
                            <div style={{
                                position: "absolute", bottom: 2, right: 2,
                                background: "#fff", borderRadius: "50%", width: 28, height: 28,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.25)", fontSize: "0.85rem",
                            }}>📷</div>
                            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.2rem" }}>
                                {form.first_name || form.last_name ? `${form.first_name} ${form.last_name}`.trim() : "Ton nom apparaîtra ici"}
                            </div>
                            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                                {form.university_id
                                    ? universities.find(u => String(u.id) === form.university_id)?.name || ""
                                    : "Aucune université sélectionnée"}
                            </div>
                            <button type="button" onClick={() => fileInputRef.current.click()} style={{
                                background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)",
                                borderRadius: "999px", color: "#fff", padding: "0.4rem 1rem",
                                fontSize: "0.82rem", cursor: "pointer", fontWeight: 600,
                                transition: "background 0.2s",
                            }}>
                                📷 Changer la photo
                            </button>
                        </div>
                    </div>

                    {/* ── Alerts ── */}
                    {error && (
                        <div style={{
                            background: "#fef2f2", border: "1px solid #fecaca",
                            borderRadius: "12px", padding: "0.85rem 1rem",
                            color: "#dc2626", fontSize: "0.9rem", marginBottom: "1.25rem",
                            display: "flex", alignItems: "center", gap: "0.5rem",
                        }}>⚠️ {error}</div>
                    )}
                    {success && (
                        <div style={{
                            background: "#f0fdf4", border: "1px solid #bbf7d0",
                            borderRadius: "12px", padding: "0.85rem 1rem",
                            color: "#16a34a", fontSize: "0.9rem", marginBottom: "1.25rem",
                            display: "flex", alignItems: "center", gap: "0.5rem",
                        }}>✅ Profil mis à jour ! Redirection…</div>
                    )}

                    {/* ── Informations personnelles ── */}
                    <div style={card}>
                        <h3 style={{ marginBottom: "1.25rem", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Informations personnelles
                        </h3>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <div style={grp}>
                                <label style={label}>Prénom</label>
                                <input name="first_name" type="text" style={field}
                                    value={form.first_name} onChange={handleChange}
                                    placeholder="Amadou" onFocus={focusIn} onBlur={focusOut} />
                            </div>
                            <div style={grp}>
                                <label style={label}>Nom de famille</label>
                                <input name="last_name" type="text" style={field}
                                    value={form.last_name} onChange={handleChange}
                                    placeholder="Diallo" onFocus={focusIn} onBlur={focusOut} />
                            </div>
                        </div>

                        <div style={grp}>
                            <label style={label}>Je suis…</label>
                            <select name="role" style={field} value={form.role}
                                onChange={handleChange} onFocus={focusIn} onBlur={focusOut}>
                                <option value="newcomer">Nouvel arrivant (étudiant)</option>
                                <option value="mentor">Mentor (étudiant expérimenté)</option>
                            </select>
                        </div>

                        {isMentor && (
                            <div style={{ marginBottom: 0 }}>
                                <label style={label}>Ma bio (visible par les étudiants)</label>
                                <textarea name="bio"
                                    style={{ ...field, resize: "vertical", minHeight: 100 }}
                                    value={form.bio} onChange={handleChange}
                                    placeholder="Parle de toi : ton parcours, ton université, tes spécialités, pourquoi tu veux aider…"
                                    rows={4} onFocus={focusIn} onBlur={focusOut} />
                            </div>
                        )}
                    </div>

                    {/* ── Université & Localisation ── */}
                    <div style={{ ...card, marginBottom: "1.5rem" }}>
                        <h3 style={{ marginBottom: "1.25rem", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Université &amp; Localisation
                        </h3>

                        <div style={grp}>
                            <label style={label}>Mon université</label>
                            <select name="university_id" style={field} value={form.university_id}
                                onChange={handleChange} required onFocus={focusIn} onBlur={focusOut}>
                                <option value="">-- Choisir --</option>
                                {universities.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={grp}>
                            <label style={label}>Ville</label>
                            <input name="city" type="text" style={field}
                                value={form.city} onChange={handleChange}
                                placeholder="Lévis, Québec, Montréal…"
                                onFocus={focusIn} onBlur={focusOut} />
                        </div>

                        <div style={{ marginBottom: 0 }}>
                            <label style={label}>Langue préférée</label>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                                {[["fr", "🇫🇷 Français"], ["en", "🇬🇧 English"]].map(([val, lbl]) => (
                                    <label key={val} style={{
                                        display: "flex", alignItems: "center", gap: "0.5rem",
                                        cursor: "pointer", fontWeight: form.language === val ? 700 : 500,
                                        padding: "0.55rem 1.25rem", borderRadius: "999px",
                                        background: form.language === val ? (isMentor ? "#ede9fe" : "#dbeafe") : "#f8fafc",
                                        border: `2px solid ${form.language === val ? (isMentor ? "#8b5cf6" : "#2563eb") : "#e2e8f0"}`,
                                        color: form.language === val ? (isMentor ? "#6d28d9" : "#1d4ed8") : "#64748b",
                                        transition: "all 0.2s", fontSize: "0.92rem",
                                    }}>
                                        <input type="radio" name="language" value={val}
                                            checked={form.language === val} onChange={handleChange}
                                            style={{ display: "none" }} />
                                        {lbl}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Submit ── */}
                    <button
                        type="submit"
                        disabled={loading || !form.university_id}
                        style={{
                            width: "100%",
                            background: loading || !form.university_id ? "#94a3b8" : accentGrad,
                            border: "none", borderRadius: "16px",
                            padding: "1rem", fontSize: "1.05rem",
                            fontWeight: 700, color: "#fff",
                            cursor: loading || !form.university_id ? "not-allowed" : "pointer",
                            boxShadow: loading ? "none" : "0 6px 20px rgba(37,99,235,0.3)",
                            transition: "all 0.2s", letterSpacing: "-0.01em",
                        }}
                        onMouseEnter={e => { if (!loading && form.university_id) e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                        {loading ? "💾 Sauvegarde en cours…" : "💾 Sauvegarder mon profil →"}
                    </button>

                </form>
            </div>
        </div>
    );
}
