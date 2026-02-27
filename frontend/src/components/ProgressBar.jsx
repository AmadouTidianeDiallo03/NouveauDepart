export default function ProgressBar({ value = 0, max = 100, label, sublabel, color = "linear-gradient(90deg, #2563eb, #6366f1)" }) {
    const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
    return (
        <div>
            {(label || sublabel) && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#374151" }}>{label}</span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1d4ed8" }}>{sublabel || `${pct}%`}</span>
                </div>
            )}
            <div style={{
                height: 10, borderRadius: "999px",
                background: "#e2e8f0",
                overflow: "hidden",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)",
            }}
                role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
            >
                <div style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: color,
                    borderRadius: "999px",
                    transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: "0 2px 6px rgba(37,99,235,0.3)",
                }} />
            </div>
        </div>
    );
}
