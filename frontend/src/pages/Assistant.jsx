import AssistantChat from "../components/AssistantChat";

const tips = [
    { icon: "💬", text: "Pose ta question en français ou en anglais" },
    { icon: "🎓", text: "Questions sur l'université, l'immigration, la vie au Québec" },
    { icon: "🔍", text: "Basé sur notre base de connaissances NouveauDépart" },
];

export default function Assistant() {
    return (
        <div className="page-content" style={{ background: "linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%)", minHeight: "100vh" }}>
            {/* Hero */}
            <div style={{
                background: "linear-gradient(135deg, #0f172a, #1e1b4b, #312e81)",
                padding: "2rem 0 3.5rem",
                marginBottom: "-2rem",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(99,102,241,0.2)" }} />
                <div style={{ position: "absolute", bottom: -30, left: "30%", width: 140, height: 140, borderRadius: "50%", background: "rgba(139,92,246,0.15)" }} />
                <div className="container container-sm">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: "18px",
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "2rem", flexShrink: 0,
                            boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                        }}>🤖</div>
                        <div>
                            <h1 style={{ color: "#fff", marginBottom: "0.25rem" }}>NouveauBot</h1>
                            <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "0.9rem" }}>
                                Ton assistant IA pour l'intégration au Québec
                            </p>
                        </div>
                    </div>

                    {/* Tips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                        {tips.map((tip) => (
                            <div key={tip.text} style={{
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "999px",
                                padding: "0.3rem 0.9rem",
                                fontSize: "0.8rem",
                                color: "rgba(255,255,255,0.85)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                            }}>
                                <span>{tip.icon}</span> {tip.text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container container-sm" style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                    background: "#fff",
                    borderRadius: "24px",
                    boxShadow: "0 8px 32px rgba(99,102,241,0.12)",
                    overflow: "hidden",
                    border: "1px solid #e0e7ff",
                }}>
                    <AssistantChat />
                </div>
            </div>
        </div>
    );
}
