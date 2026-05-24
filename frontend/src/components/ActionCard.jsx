import { Link } from "react-router-dom";

export default function ActionCard({ to, icon, title, desc, gradient }) {
    return (
        <Link to={to} style={{ textDecoration: "none" }}>
            <div style={{
                background: gradient,
                borderRadius: "20px",
                padding: "1.75rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                height: "100%",
                minHeight: "160px",
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.18)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
                }}
            >
                <div style={{ fontSize: "2.5rem", lineHeight: 1 }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}>{title}</div>
                <div style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{desc}</div>
            </div>
        </Link>
    );
}
