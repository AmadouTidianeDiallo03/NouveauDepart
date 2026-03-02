import { useState } from "react";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";

export default function TaskItem({ task, onToggle }) {
    const { lang } = useLanguage();
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);

    // Get localized fields
    const title = lang === "en" ? (task.title_en || task.title) : task.title;
    const description = lang === "en" ? (task.description_en || task.description) : task.description;
    const howTo = lang === "en" ? (task.how_to_en || task.how_to) : task.how_to;
    const tips = lang === "en" ? (task.tips_en || task.tips) : task.tips;
    const locations = lang === "en" ? (task.locations_en || task.locations) : task.locations;

    async function handleToggle(e) {
        e.stopPropagation();
        setLoading(true);
        try {
            const res = await api.post(`/guides/tasks/${task.id}/toggle/`);
            onToggle(task.id, res.data.done);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const hasDetails = howTo || tips || locations;

    return (
        <div style={{
            marginBottom: "0.75rem",
            background: "#fff",
            borderRadius: "16px",
            border: `1.5px solid ${task.done ? "#86efac" : expanded ? "#93c5fd" : "#f1f5f9"}`,
            boxShadow: expanded ? "0 10px 25px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}>
            {/* Header / Main Card */}
            <div
                onClick={() => hasDetails && setExpanded(!expanded)}
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.1rem 1.25rem",
                    cursor: hasDetails ? "pointer" : "default",
                    background: task.done ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "#fff",
                    transition: "background 0.2s",
                }}
                onMouseEnter={e => {
                    if (!task.done && hasDetails) e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={e => {
                    if (!task.done) e.currentTarget.style.background = "#fff";
                }}
            >
                {/* Custom Checkbox */}
                <div
                    onClick={handleToggle}
                    style={{
                        width: 24, height: 24, borderRadius: "8px", flexShrink: 0, marginTop: "0.15rem",
                        background: task.done ? "linear-gradient(135deg, #22c55e, #16a34a)" : "#fff",
                        border: `2px solid ${task.done ? "#22c55e" : "#cbd5e1"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.25s",
                        boxShadow: task.done ? "0 2px 8px rgba(34,197,94,0.35)" : "none",
                        opacity: loading ? 0.5 : 1,
                    }}
                >
                    {task.done && (
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                            <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>

                {/* Text Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontWeight: 700, fontSize: "0.95rem",
                        color: task.done ? "#166534" : "#1e293b",
                        textDecoration: task.done ? "line-through" : "none",
                        opacity: task.done ? 0.7 : 1,
                        marginBottom: description ? "0.25rem" : 0,
                    }}>
                        {title}
                    </div>
                    {description && (
                        <div style={{
                            fontSize: "0.85rem",
                            color: "#64748b",
                            lineHeight: 1.5,
                            display: expanded ? "none" : "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}>
                            {description}
                        </div>
                    )}
                </div>

                {/* Expand Indicator */}
                {hasDetails && (
                    <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: expanded ? "rgba(37, 99, 235, 0.1)" : "rgba(0,0,0,0.03)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: expanded ? "#2563eb" : "#94a3b8",
                        fontSize: "0.7rem",
                        transition: "all 0.3s",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        flexShrink: 0,
                    }}>
                        ▼
                    </div>
                )}
            </div>

            {/* Expanded Details Section */}
            {expanded && (
                <div style={{
                    padding: "0 1.25rem 1.25rem",
                    background: "#fff",
                    animation: "slideDown 0.3s ease-out",
                }}>
                    {description && (
                        <div style={{
                            fontSize: "0.9rem", color: "#475569",
                            padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9",
                            marginBottom: "1rem", lineHeight: 1.6
                        }}>
                            {description}
                        </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {/* How To */}
                        {howTo && (
                            <section>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                    <span style={{ fontSize: "1.1rem" }}>🛠️</span>
                                    <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Comment procéder</h4>
                                </div>
                                <div style={{
                                    background: "#f8fafc", padding: "1rem", borderRadius: "12px",
                                    fontSize: "0.9rem", color: "#475569", lineHeight: 1.6,
                                    border: "1px solid #e2e8f0"
                                }}>
                                    {howTo}
                                </div>
                            </section>
                        )}

                        {/* Tips */}
                        {tips && (
                            <section>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                    <span style={{ fontSize: "1.1rem" }}>💡</span>
                                    <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#ea580c", textTransform: "uppercase", letterSpacing: "0.05em" }}>Conseils d'expert</h4>
                                </div>
                                <div style={{
                                    background: "#fff7ed", padding: "1rem", borderRadius: "12px",
                                    fontSize: "0.9rem", color: "#9a3412", lineHeight: 1.6,
                                    border: "1px solid #ffedd5"
                                }}>
                                    {tips}
                                </div>
                            </section>
                        )}

                        {/* Locations */}
                        {locations && (
                            <section>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                    <span style={{ fontSize: "1.1rem" }}>📍</span>
                                    <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.05em" }}>Où aller / Liens</h4>
                                </div>
                                <div style={{
                                    background: "#eff6ff", padding: "1rem", borderRadius: "12px",
                                    fontSize: "0.9rem", color: "#1e40af", lineHeight: 1.6,
                                    border: "1px solid #dbeafe"
                                }}>
                                    {locations}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
