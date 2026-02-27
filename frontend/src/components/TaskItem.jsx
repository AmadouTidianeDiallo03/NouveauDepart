import api from "../services/api";

export default function TaskItem({ task, onToggle }) {
    async function handleToggle() {
        try {
            const res = await api.post(`/guides/tasks/${task.id}/toggle/`);
            onToggle(task.id, res.data.done);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div
            onClick={handleToggle}
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.85rem",
                padding: "0.85rem 1rem",
                borderRadius: "12px",
                background: task.done ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "#f8fafc",
                border: `1.5px solid ${task.done ? "#86efac" : "#e2e8f0"}`,
                marginBottom: "0.5rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                userSelect: "none",
            }}
            onMouseEnter={e => {
                if (!task.done) {
                    e.currentTarget.style.borderColor = "#93c5fd";
                    e.currentTarget.style.background = "#eff6ff";
                }
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = task.done ? "#86efac" : "#e2e8f0";
                e.currentTarget.style.background = task.done ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "#f8fafc";
            }}
        >
            {/* Custom checkbox */}
            <div style={{
                width: 22, height: 22, borderRadius: "6px", flexShrink: 0, marginTop: "0.1rem",
                background: task.done ? "linear-gradient(135deg, #22c55e, #16a34a)" : "#fff",
                border: `2px solid ${task.done ? "#22c55e" : "#cbd5e1"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                boxShadow: task.done ? "0 2px 6px rgba(34,197,94,0.3)" : "none",
            }}>
                {task.done && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontWeight: 600, fontSize: "0.9rem",
                    color: task.done ? "#166534" : "#1e293b",
                    textDecoration: task.done ? "line-through" : "none",
                    opacity: task.done ? 0.75 : 1,
                    transition: "all 0.2s",
                }}>
                    {task.title}
                </div>
                {task.description && (
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem", lineHeight: 1.5 }}>
                        {task.description}
                    </div>
                )}
            </div>

            {task.done && (
                <div style={{
                    fontSize: "0.72rem", fontWeight: 700, color: "#16a34a",
                    background: "#dcfce7", borderRadius: "999px",
                    padding: "0.15rem 0.5rem", flexShrink: 0,
                }}>
                    ✓ Fait
                </div>
            )}
        </div>
    );
}
