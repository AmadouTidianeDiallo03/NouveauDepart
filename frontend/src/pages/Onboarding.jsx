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

    // Pre-fill form with current user data
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
            if (user.profile?.avatar_url) {
                setAvatarPreview(user.profile.avatar_url);
            }
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
            // If there's a new avatar, upload via FormData
            if (avatarFile) {
                const fd = new FormData();
                fd.append("avatar", avatarFile);
                // Patch user fields too
                fd.append("first_name", form.first_name);
                fd.append("last_name", form.last_name);
                await api.patch("/auth/me", fd, { headers: { "Content-Type": "multipart/form-data" } });
            }
            // Save profile data
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
            setTimeout(() => navigate("/dashboard"), 1200);
        } catch (err) {
            setError("Erreur lors de la sauvegarde. Réessaye.");
        } finally {
            setLoading(false);
        }
    }

    const isMentor = form.role === "mentor";
    const avatarLetter = (form.first_name?.[0] || user?.email?.[0] || "U").toUpperCase();

    return (
        <div className="page-content" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)", minHeight: "100vh" }}>
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.25rem" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                        Mon Profil {isMentor ? "Mentor 🌟" : "Étudiant 🎓"}
                    </h1>
                    <p style={{ color: "#64748b" }}>
                        {isMentor
                            ? "Personnalise ton profil pour inspirer confiance aux étudiants."
                            : "Complète ton profil pour une expérience personnalisée."}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Avatar Section */}
                    <div style={{
                        background: isMentor
                            ? "linear-gradient(135deg, #1e1b4b, #4338ca)"
                            : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                        borderRadius: "24px",
                        padding: "2rem",
                        marginBottom: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "2rem",
                        flexWrap: "wrap",
                    }}>
                        {/* Avatar */}
                        <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileInputRef.current.click()}>
                            <div style={{
                                width: 100, height: 100, borderRadius: "50%",
                                background: avatarPreview ? "transparent" : "rgba(255,255,255,0.2)",
                                border: "3px solid rgba(255,255,255,0.5)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "2.5rem", fontWeight: 800, color: "#fff",
                                overflow: "hidden", flexShrink: 0,
                                transition: "transform 0.2s",
                            }}>
                                {avatarPreview
                                    ? <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : avatarLetter
                                }
                            </div>
                            {/* Edit overlay */}
                            <div style={{
                                position: "absolute", bottom: 0, right: 0,
                                background: "#fff", borderRadius: "50%",
                                width: 30, height: 30, display: "flex",
                                alignItems: "center", justifyContent: "center",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                fontSize: "0.9rem",
                            }}>
                                📷
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleAvatarChange}
                            />
                        </div>

                        <div>
                            <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                                {form.first_name || form.last_name
                                    ? `${form.first_name} ${form.last_name}`.trim()
                                    : "Ton nom apparaîtra ici"}
                            </div>
                            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", marginBottom: "0.75rem" }}>
                                {form.university_id
                                    ? universities.find(u => String(u.id) === form.university_id)?.name || ""
                                    : "Aucune université sélectionnée"}
                            </div>
                            <button type="button" onClick={() => fileInputRef.current.click()}
                                style={{
                                    background: "rgba(255,255,255,0.2)",
                                    border: "1px solid rgba(255,255,255,0.4)",
                                    borderRadius: "999px",
                                    color: "#fff",
                                    padding: "0.35rem 1rem",
                                    fontSize: "0.82rem",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}>
                                📷 Changer la photo
                            </button>
                        </div>
                    </div>

                    {/* Error / Success */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">✅ Profil mis à jour ! Redirection...</div>}

                    {/* Form fields */}
                    <div style={{ background: "#fff", borderRadius: "20px", padding: "1.75rem", marginBottom: "1.25rem", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                        <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Informations personnelles
                        </h3>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Prénom</label>
                                <input name="first_name" type="text" className="form-input" value={form.first_name} onChange={handleChange} placeholder="Amadou" />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Nom de famille</label>
                                <input name="last_name" type="text" className="form-input" value={form.last_name} onChange={handleChange} placeholder="Diallo" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Je suis…</label>
                            <select name="role" className="form-select" value={form.role} onChange={handleChange}>
                                <option value="newcomer">Nouvel arrivant (étudiant)</option>
                                <option value="mentor">Mentor (étudiant expérimenté)</option>
                            </select>
                        </div>

                        {isMentor && (
                            <div className="form-group">
                                <label className="form-label">Ma bio (visible par les étudiants)</label>
                                <textarea
                                    name="bio"
                                    className="form-textarea"
                                    value={form.bio}
                                    onChange={handleChange}
                                    placeholder="Parle de toi : ton parcours, ton université, tes spécialités, pourquoi tu veux aider…"
                                    rows={4}
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ background: "#fff", borderRadius: "20px", padding: "1.75rem", marginBottom: "1.5rem", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                        <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Université & Localisation
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Mon université</label>
                            <select name="university_id" className="form-select" value={form.university_id} onChange={handleChange} required>
                                <option value="">-- Choisir --</option>
                                {universities.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Ville</label>
                            <input name="city" type="text" className="form-input" value={form.city} onChange={handleChange} placeholder="Lévis, Québec, Montréal…" />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Langue préférée</label>
                            <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
                                {[["fr", "🇫🇷 Français"], ["en", "🇬🇧 English"]].map(([val, label]) => (
                                    <label key={val} style={{
                                        display: "flex", alignItems: "center", gap: "0.5rem",
                                        cursor: "pointer", fontWeight: form.language === val ? 700 : 400,
                                        padding: "0.5rem 1rem",
                                        borderRadius: "999px",
                                        background: form.language === val ? "#dbeafe" : "#f8fafc",
                                        border: `2px solid ${form.language === val ? "#2563eb" : "#e2e8f0"}`,
                                        transition: "all 0.2s",
                                        fontSize: "0.95rem",
                                    }}>
                                        <input type="radio" name="language" value={val} checked={form.language === val} onChange={handleChange} style={{ display: "none" }} />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary btn-block btn-lg"
                        type="submit"
                        disabled={loading || !form.university_id}
                        style={{
                            background: isMentor
                                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                                : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                            border: "none",
                            borderRadius: "16px",
                            padding: "1rem",
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
                            transition: "all 0.2s",
                        }}
                    >
                        {loading ? "Sauvegarde…" : "💾 Sauvegarder mon profil"}
                    </button>
                </form>
            </div>
        </div>
    );
}
