export default function MenteeProfileModal({ profile, onClose }) {
    if (!profile) return null;
    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
        }} onClick={onClose}>
            <div style={{
                background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "600px",
                maxHeight: "90vh", overflowY: "auto", position: "relative", padding: "2.5rem"
            }} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{ position: "absolute", top: "1rem", right: "1.5rem", border: 0, background: "none", fontSize: "2rem", cursor: "pointer", color: "#94a3b8" }}>&times;</button>

                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "2rem" }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 800, color: "#6366f1" }}>
                        {profile.avatar_url ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : profile.full_name?.[0]}
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>{profile.full_name}</h2>
                        <p style={{ margin: "0.25rem 0", color: "#6366f1", fontWeight: 700 }}>{profile.university_name}</p>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                            📍 {profile.city} | 🌐 {profile.language === "en" ? "English" : "Français"}
                        </div>
                    </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "16px", marginBottom: "1.5rem" }}>
                    <h4 style={{ margin: "0 0 0.5rem", color: "#1e293b" }}>Bio / Présentation</h4>
                    <p style={{ margin: 0, color: "#475569", lineHeight: 1.6, fontSize: "0.95rem" }}>
                        {profile.bio || "Aucune biographie renseignée."}
                    </p>
                </div>

                <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.75rem", fontStyle: "italic", margin: 0 }}>
                    Ce profil est en lecture seule. Vous ne pouvez pas le modifier.
                </p>
            </div>
        </div>
    );
}
