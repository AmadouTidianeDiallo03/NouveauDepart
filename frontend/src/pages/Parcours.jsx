import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const stageColors = {
    before_arrival: ["#eff6ff", "#1d4ed8"],
    arrival: ["#f0fdf4", "#15803d"],
    after_arrival: ["#fff7ed", "#c2410c"],
};

const cardStyle = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: "1.25rem",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

export default function Parcours() {
    const [stages, setStages] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                const [stagesRes, dashboardRes] = await Promise.all([
                    api.get("/integration-stages/"),
                    api.get("/integration-stages/dashboard/"),
                ]);
                if (!mounted) return;
                setStages(stagesRes.data);
                setDashboard(dashboardRes.data);
            } catch (err) {
                console.error("Parcours loading error:", err);
                if (mounted) setError("Impossible de charger ton parcours pour le moment.");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => {
            mounted = false;
        };
    }, []);

    async function selectStage(key) {
        setSaving(key);
        try {
            const res = await api.post("/integration-stages/select/", { key });
            setDashboard(res.data);
        } catch (err) {
            console.error("Stage select error:", err);
            setError("Impossible de changer ton étape pour le moment.");
        } finally {
            setSaving("");
        }
    }

    async function toggleTask(taskId) {
        try {
            const res = await api.post(`/integration-stages/tasks/${taskId}/toggle/`);
            setDashboard(res.data);
        } catch (err) {
            console.error("Stage task toggle error:", err);
            setError("Impossible de mettre à jour cette tâche.");
        }
    }

    if (loading) {
        return (
            <div className="page-content">
                <div className="container" style={{ padding: "3rem 0" }}>
                    <div className="spinner" />
                    <p style={{ textAlign: "center", color: "#64748b" }}>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content" style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <section style={{ background: "linear-gradient(135deg, #111827, #1d4ed8)", color: "#fff", padding: "2.5rem 0" }}>
                <div className="container">
                    <p style={{ margin: "0 0 0.5rem", opacity: 0.78, fontWeight: 800 }}>Mon parcours</p>
                    <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
                        Choisis l’étape qui correspond à ta situation.
                    </h1>
                    <p style={{ margin: "0.75rem 0 0", opacity: 0.85 }}>
                        NouveauDépart adapte les tâches, guides et actions selon ton moment d’intégration.
                    </p>
                </div>
            </section>

            <div className="container" style={{ padding: "2rem 0" }}>
                {error && (
                    <div style={{ ...cardStyle, borderColor: "#fecaca", color: "#991b1b", marginBottom: "1rem" }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                    {stages.map((stage) => (
                        <StageCard
                            key={stage.key}
                            stage={stage}
                            selected={dashboard?.current_stage?.key === stage.key}
                            saving={saving === stage.key}
                            onSelect={() => selectStage(stage.key)}
                        />
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                    <StageTasks tasks={dashboard?.tasks || []} onToggle={toggleTask} />
                    <div style={{ display: "grid", gap: "1rem" }}>
                        <RecommendedGuides guides={dashboard?.recommended_guides || []} />
                        <QuickActions actions={dashboard?.quick_actions || []} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StageCard({ stage, selected, saving, onSelect }) {
    const [bg, accent] = stageColors[stage.key] || ["#f8fafc", "#1d4ed8"];

    return (
        <section style={{ ...cardStyle, background: selected ? bg : "#fff", borderColor: selected ? accent : "#e2e8f0" }}>
            <div style={{ color: accent, fontWeight: 900, fontSize: "0.82rem", textTransform: "uppercase" }}>
                Étape {stage.order}
            </div>
            <h2 style={{ margin: "0.45rem 0", color: "#0f172a" }}>{stage.title}</h2>
            <p style={{ color: "#64748b", lineHeight: 1.5, minHeight: 48 }}>{stage.description}</p>
            <button className="btn btn-primary" onClick={onSelect} disabled={saving || selected} style={{ width: "100%", justifyContent: "center" }}>
                {selected ? "Étape actuelle" : saving ? "Enregistrement..." : "Choisir cette étape"}
            </button>
        </section>
    );
}

function StageTasks({ tasks, onToggle }) {
    return (
        <section style={cardStyle}>
            <h2 style={{ margin: "0 0 1rem", color: "#0f172a" }}>Tâches à faire</h2>
            {tasks.length ? (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {tasks.map((task) => (
                        <button
                            key={task.id}
                            onClick={() => onToggle(task.id)}
                            style={{
                                textAlign: "left",
                                background: task.status === "complété" ? "#f0fdf4" : "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: 12,
                                padding: "0.9rem",
                                cursor: "pointer",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontWeight: 900, color: "#0f172a" }}>{task.title}</div>
                                    <div style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.2rem" }}>{task.description}</div>
                                </div>
                                <span style={{ whiteSpace: "nowrap", borderRadius: 999, padding: "0.3rem 0.6rem", fontWeight: 800, background: "#eef2ff", color: "#3730a3", fontSize: "0.78rem" }}>
                                    {task.status}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <p style={{ color: "#64748b", margin: 0 }}>Choisis une étape pour voir les tâches adaptées.</p>
            )}
        </section>
    );
}

function RecommendedGuides({ guides }) {
    return (
        <section style={cardStyle}>
            <h2 style={{ margin: "0 0 1rem", color: "#0f172a" }}>Guides associés</h2>
            {guides.length ? (
                <div style={{ display: "grid", gap: "0.7rem" }}>
                    {guides.map((guide) => (
                        <Link key={guide.id} to="/study-success" style={{ textDecoration: "none", color: "inherit" }}>
                            <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "0.8rem" }}>
                                <div style={{ fontWeight: 900 }}>{guide.title}</div>
                                <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{guide.category}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p style={{ color: "#64748b", margin: 0 }}>Aucun guide associé pour le moment.</p>
            )}
        </section>
    );
}

function QuickActions({ actions }) {
    return (
        <section style={cardStyle}>
            <h2 style={{ margin: "0 0 1rem", color: "#0f172a" }}>Actions rapides</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem" }}>
                {actions.length ? (
                    actions.map((action) => (
                        <Link key={action.to + action.label} className="btn btn-primary" to={action.to}>
                            {action.label}
                        </Link>
                    ))
                ) : (
                    <p style={{ color: "#64748b", margin: 0 }}>Aucune action disponible.</p>
                )}
            </div>
        </section>
    );
}
