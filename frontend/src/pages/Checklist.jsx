import { useState, useEffect } from "react";
import api from "../services/api";
import StepList from "../components/StepList";
import ProgressBar from "../components/ProgressBar";
import BackButton from "../components/BackButton";

const CATEGORY_COLORS = {
    admin: { bg: "linear-gradient(135deg, #f59e0b, #ef4444)", icon: "🏛️" },
    university: { bg: "linear-gradient(135deg, #2563eb, #6366f1)", icon: "🎓" },
    transport: { bg: "linear-gradient(135deg, #8b5cf6, #ec4899)", icon: "🚌" },
    housing: { bg: "linear-gradient(135deg, #10b981, #059669)", icon: "🏠" },
    work: { bg: "linear-gradient(135deg, #0f172a, #334155)", icon: "💼" },
    lifestyle: { bg: "linear-gradient(135deg, #f97316, #fbbf24)", icon: "☀️" },
    default: { bg: "linear-gradient(135deg, #64748b, #475569)", icon: "📋" },
};

export default function Checklist() {
    const [steps, setSteps] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get("/guides/steps/"), api.get("/guides/progress/")])
            .then(async ([stepsRes, progRes]) => {
                const stepsData = stepsRes.data.results || stepsRes.data;
                const withTasks = await Promise.all(
                    stepsData.map(async (step) => {
                        const r = await api.get(`/guides/steps/${step.id}/tasks/`);
                        return { ...step, tasks: r.data.tasks || [] };
                    })
                );
                setSteps(withTasks);
                setProgress(progRes.data);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="page-content"><div className="spinner" /></div>;

    const pct = progress ? Math.round((progress.done_tasks / Math.max(progress.total_tasks, 1)) * 100) : 0;

    return (
        <div className="page-content" style={{ background: "linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%)", minHeight: "100vh" }}>
            {/* Hero */}
            <div style={{
                background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #2563eb 100%)",
                padding: "2.5rem 0 4rem",
                marginBottom: "-2rem",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(99,102,241,0.25)" }} />
                <div className="container container-sm">
                    <BackButton />
                    <div style={{ color: "#93c5fd", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                        📋 Mon parcours d'intégration
                    </div>
                    <h1 style={{ color: "#fff", marginBottom: "0.5rem" }}>Ma Checklist</h1>
                    <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                        Complète chaque étape à ton rythme pour réussir ton arrivée au Québec.
                    </p>

                    {/* Big progress ring display */}
                    {progress && (
                        <div style={{
                            background: "rgba(255,255,255,0.12)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "20px",
                            padding: "1.25rem 1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "1.5rem",
                        }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: "50%",
                                background: `conic-gradient(#60a5fa ${pct * 3.6}deg, rgba(255,255,255,0.2) 0deg)`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                                position: "relative",
                            }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: "50%",
                                    background: "rgba(30,58,95,0.9)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#fff", fontWeight: 800, fontSize: "1.1rem",
                                }}>
                                    {pct}%
                                </div>
                            </div>
                            <div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem" }}>{progress.done_tasks} tâches complétées</div>
                                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem" }}>sur {progress.total_tasks} au total</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container container-sm" style={{ position: "relative", zIndex: 1 }}>
                {/* Category stat chips */}
                {progress?.by_category && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
                        {progress.by_category.map((cat) => {
                            const color = CATEGORY_COLORS[cat.step_id] || CATEGORY_COLORS.default;
                            const catPct = Math.round((cat.done / Math.max(cat.total, 1)) * 100);
                            return (
                                <div key={cat.step_id} style={{
                                    background: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "14px",
                                    padding: "0.75rem 1.25rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    flex: "1 1 170px",
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "10px",
                                        background: color.bg,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "1.1rem", flexShrink: 0,
                                    }}>
                                        {color.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>{cat.title}</div>
                                        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>{cat.done}/{cat.total} <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: "0.8rem" }}>({catPct}%)</span></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <StepList steps={steps} />
            </div>
        </div>
    );
}
