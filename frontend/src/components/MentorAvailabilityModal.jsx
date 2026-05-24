import { useState } from "react";
import PropTypes from "prop-types";

export default function MentorAvailabilityModal({ mentor, isOpen, onClose, onRequest }) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

    const dayLabels = {
        monday: "Lundi",
        tuesday: "Mardi",
        wednesday: "Mercredi",
        thursday: "Jeudi",
        friday: "Vendredi",
        saturday: "Samedi",
        sunday: "Dimanche",
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onRequest(message);
            setRequestSent(true);
            setTimeout(() => {
                onClose();
                setRequestSent(false);
                setMessage("");
            }, 2000);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !mentor) return null;

    const profileUniversity = mentor?.profile?.university;
    const universityName = mentor?.university?.name || mentor?.profile?.university_info?.name || (profileUniversity && typeof profileUniversity === "object" ? profileUniversity.name : "");

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
                    maxWidth: "550px",
                    maxHeight: "80vh",
                    overflow: "auto",
                    zIndex: 1000,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                }}
            >
                {requestSent ? (
                    <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
                        <p style={{ fontSize: "3rem", margin: "0 0 1rem 0" }}>✅</p>
                        <h3 style={{ color: "#10b981", margin: 0 }}>Demande envoyée!</h3>
                        <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
                            Votre demande a été envoyée à {mentor?.first_name}. Attendez sa réponse.
                        </p>
                    </div>
                ) : (
                    <>
                        
                        <div
                            style={{
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                padding: "2rem",
                                color: "#fff",
                                borderBottom: "1px solid #e2e8f0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "start",
                            }}
                        >
                            <div>
                                <h2 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1.5rem" }}>
                                    Demander {mentor?.first_name}
                                </h2>
                                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
                                    {universityName || "Université non indiquée"}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#fff",
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        
                        <div style={{ padding: "2rem" }}>
                            
                            {mentor.availabilities && mentor.availabilities.length > 0 && (
                                <div style={{ marginBottom: "2rem" }}>
                                    <h4 style={{ color: "#0f172a", marginBottom: "1rem" }}>
                                        📅 Disponibilités
                                    </h4>
                                    <div
                                        style={{
                                            background: "#f8fafc",
                                            borderRadius: "12px",
                                            padding: "1rem",
                                        }}
                                    >
                                        {mentor.availabilities.map((avail) => (
                                            <div
                                                key={avail.id}
                                                style={{
                                                    padding: "0.75rem",
                                                    borderBottom: "1px solid #e2e8f0",
                                                }}
                                            >
                                                <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>
                                                    {dayLabels[avail.day_of_week]}
                                                </p>
                                                <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                                                    {avail.start_time} - {avail.end_time}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", color: "#0f172a", fontWeight: 600 }}>
                                    Votre message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Présentez-vous et expliquez pourquoi vous aimeriez travailler avec ce mentor..."
                                    style={{
                                        width: "100%",
                                        minHeight: "120px",
                                        padding: "0.75rem",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: "8px",
                                        fontFamily: "inherit",
                                        fontSize: "0.95rem",
                                        resize: "vertical",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>

                            
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button
                                    onClick={onClose}
                                    style={{
                                        flex: 1,
                                        padding: "0.75rem",
                                        background: "#f1f5f9",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: "8px",
                                        color: "#0f172a",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !message.trim()}
                                    style={{
                                        flex: 1,
                                        padding: "0.75rem",
                                        background: loading || !message.trim() ? "#cbd5e1" : "#6366f1",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontWeight: 600,
                                        cursor: loading || !message.trim() ? "not-allowed" : "pointer",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading && message.trim()) {
                                            e.currentTarget.style.background = "#4f46e5";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!loading && message.trim()) {
                                            e.currentTarget.style.background = "#6366f1";
                                        }
                                    }}
                                >
                                    {loading ? "Envoi..." : "Envoyer la demande"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

MentorAvailabilityModal.propTypes = {
    mentor: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onRequest: PropTypes.func.isRequired,
};
