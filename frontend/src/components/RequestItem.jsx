export default function RequestItem({ request, onAction, onViewProfile }) {
    const mentee = request.mentee_info || {};
    const avatarLetter = mentee.full_name?.[0]?.toUpperCase() || "E";

    return (
        <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "1.25rem",
            marginBottom: "1rem",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
            <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "#f1f5f9", color: "#6366f1",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: "1.2rem", flexShrink: 0
            }}>
                {mentee.avatar_url ? <img src={mentee.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : avatarLetter}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#1e293b" }}>{mentee.full_name}</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{mentee.university_name || mentee.university?.name}</div>
                <p style={{ fontSize: "0.85rem", color: "#475569", margin: "0.4rem 0 0", fontStyle: "italic" }}>
                    "{request.message}"
                </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                    onClick={() => onViewProfile(mentee.id)}
                    style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "0.5rem 1rem", borderRadius: "10px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                >
                    Voir Profil
                </button>
                <button
                    onClick={() => onAction(request.id, "accept")}
                    style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "0.5rem 1rem", borderRadius: "10px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                >
                    Accepter
                </button>
                <button
                    onClick={() => onAction(request.id, "reject")}
                    style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", padding: "0.5rem 1rem", borderRadius: "10px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                >
                    Refuser
                </button>
            </div>
        </div>
    );
}
