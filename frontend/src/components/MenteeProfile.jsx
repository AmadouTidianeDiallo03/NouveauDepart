import PropTypes from "prop-types";

export default function MenteeProfile({ user, isOpen, onClose }) {
    if (!isOpen || !user) return null;

    const avatarLetter = user.first_name?.[0]?.toUpperCase() || "U";
    const avatarUrl = user.profile?.avatar_url;
    const gradients = [
        "linear-gradient(135deg, #6366f1, #8b5cf6)",
        "linear-gradient(135deg, #0ea5e9, #6366f1)",
        "linear-gradient(135deg, #10b981, #0ea5e9)",
        "linear-gradient(135deg, #f59e0b, #ef4444)",
    ];
    const gradient = gradients[(user.id || 0) % gradients.length];
    const profileUniversity = user.profile?.university;
    const university = user.profile?.university_info || (profileUniversity && typeof profileUniversity === "object" ? profileUniversity : null);

    return (
        <>
            
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.5)",
                    zIndex: 999,
                }}
            />

            
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "#fff",
                    borderRadius: "20px",
                    width: "90%",
                    maxWidth: "500px",
                    maxHeight: "80vh",
                    overflow: "auto",
                    zIndex: 1000,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                }}
            >
                
                <div
                    style={{
                        background: gradient,
                        height: 100,
                        position: "relative",
                    }}
                >
                    
                    <button
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            background: "rgba(255, 255, 255, 0.2)",
                            border: "none",
                            color: "#fff",
                            fontSize: "1.5rem",
                            cursor: "pointer",
                            borderRadius: "50%",
                            width: 40,
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ✕
                    </button>

                    
                    <div
                        style={{
                            position: "absolute",
                            bottom: -40,
                            left: "2rem",
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            background: avatarUrl ? "transparent" : "rgba(255, 255, 255, 0.2)",
                            border: "4px solid #fff",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2rem",
                            fontWeight: 800,
                            color: "#fff",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            avatarLetter
                        )}
                    </div>
                </div>

                
                <div style={{ padding: "3.5rem 2rem 2rem" }}>
                    
                    <h2 style={{ margin: 0, marginBottom: "0.5rem", color: "#0f172a", fontSize: "1.5rem" }}>
                        {user.first_name} {user.last_name}
                    </h2>

                    
                    <p style={{ margin: 0, marginBottom: "1.5rem", color: "#64748b", fontSize: "0.9rem" }}>
                        📧 {user.email}
                    </p>

                    
                    {university && (
                        <div style={{ marginBottom: "1.5rem" }}>
                            <p style={{ margin: "0 0 0.5rem 0", color: "#475569", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>
                                Université
                            </p>
                            <p style={{ margin: 0, color: "#0f172a", fontSize: "1rem" }}>
                                {university.name}
                            </p>
                            {university.city && (
                                <p style={{ margin: "0.25rem 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
                                    📍 {university.city}
                                </p>
                            )}
                        </div>
                    )}

                    
                    {user.profile?.city && (
                        <div style={{ marginBottom: "1.5rem" }}>
                            <p style={{ margin: "0 0 0.5rem 0", color: "#475569", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>
                                Ville
                            </p>
                            <p style={{ margin: 0, color: "#0f172a", fontSize: "1rem" }}>
                                {user.profile.city}
                            </p>
                        </div>
                    )}

                    
                    {user.profile?.language && (
                        <div style={{ marginBottom: "1.5rem" }}>
                            <p style={{ margin: "0 0 0.5rem 0", color: "#475569", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>
                                Langue préférée
                            </p>
                            <p style={{ margin: 0, color: "#0f172a", fontSize: "1rem" }}>
                                {user.profile.language === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
                            </p>
                        </div>
                    )}

                    
                    {user.profile?.bio && (
                        <div style={{ marginBottom: "1.5rem" }}>
                            <p style={{ margin: "0 0 0.5rem 0", color: "#475569", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>
                                À propos
                            </p>
                            <p style={{ margin: 0, color: "#0f172a", fontSize: "0.95rem", lineHeight: 1.6 }}>
                                {user.profile.bio}
                            </p>
                        </div>
                    )}

                    
                    <div
                        style={{
                            background: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            borderRadius: "12px",
                            padding: "1rem",
                            marginTop: "1.5rem",
                            color: "#166534",
                            fontSize: "0.9rem",
                        }}
                    >
                        ℹ️ Ceci est un profil en lecture seule. Vous ne pouvez pas le modifier.
                    </div>
                </div>
            </div>
        </>
    );
}

MenteeProfile.propTypes = {
    user: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};
