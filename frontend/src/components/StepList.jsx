import { useState } from "react";
import ProgressBar from "./ProgressBar";
import TaskItem from "./TaskItem";

const STEP_GRADIENTS = [
    { bg: "linear-gradient(135deg, #1d4ed8, #6366f1)", light: "#eff6ff", border: "#bfdbfe", accent: "#2563eb" },
    { bg: "linear-gradient(135deg, #0369a1, #0ea5e9)", light: "#f0f9ff", border: "#bae6fd", accent: "#0284c7" },
    { bg: "linear-gradient(135deg, #7c3aed, #8b5cf6)", light: "#faf5ff", border: "#ddd6fe", accent: "#7c3aed" },
    { bg: "linear-gradient(135deg, #0f766e, #14b8a6)", light: "#f0fdfa", border: "#99f6e4", accent: "#0f766e" },
    { bg: "linear-gradient(135deg, #b45309, #f59e0b)", light: "#fffbeb", border: "#fde68a", accent: "#d97706" },
    { bg: "linear-gradient(135deg, #be123c, #f43f5e)", light: "#fff1f2", border: "#fecdd3", accent: "#e11d48" },
];

export default function StepList({ steps }) {
    const [expanded, setExpanded] = useState(null);
    const [localSteps, setLocalSteps] = useState(steps);

    function toggle(stepId) {
        setExpanded(expanded === stepId ? null : stepId);
    }

    function handleTaskToggle(stepId, taskId, done) {
        setLocalSteps((prev) =>
            prev.map((s) =>
                s.id === stepId
                    ? { ...s, tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, done } : t)) }
                    : s
            )
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {localSteps.map((step, idx) => {
                const isOpen = expanded === step.id;
                const theme = STEP_GRADIENTS[idx % STEP_GRADIENTS.length];
                const doneTasks = step.tasks?.filter(t => t.done).length ?? step.done_tasks ?? 0;
                const totalTasks = step.tasks?.length ?? step.total_tasks ?? 1;
                const pct = Math.round((doneTasks / Math.max(totalTasks, 1)) * 100);
                const isComplete = pct === 100;

                return (
                    <div key={step.id} style={{
                        background: "#fff",
                        borderRadius: "20px",
                        overflow: "hidden",
                        boxShadow: isOpen
                            ? `0 8px 32px ${theme.accent}22`
                            : "0 2px 12px rgba(0,0,0,0.06)",
                        border: `1.5px solid ${isOpen ? theme.border : "#f1f5f9"}`,
                        transition: "box-shadow 0.3s, border-color 0.3s",
                    }}>
                        {/* Step header */}
                        <div
                            onClick={() => toggle(step.id)}
                            role="button"
                            tabIndex={0}
                            aria-expanded={isOpen}
                            onKeyDown={(e) => e.key === "Enter" && toggle(step.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1.1rem 1.25rem",
                                cursor: "pointer",
                                userSelect: "none",
                            }}
                        >
                            {/* Step number / check */}
                            <div style={{
                                width: 44, height: 44, borderRadius: "14px", flexShrink: 0,
                                background: isComplete ? "linear-gradient(135deg, #22c55e, #16a34a)" : theme.bg,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 800, fontSize: "1rem", color: "#fff",
                                boxShadow: `0 4px 12px ${theme.accent}40`,
                                transition: "background 0.3s",
                            }}>
                                {isComplete ? (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <polyline points="4,10 8,14 16,6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    idx + 1
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: "0.97rem", color: "#0f172a", marginBottom: "0.3rem" }}>
                                    {step.title}
                                </div>
                                {/* Inline mini progress */}
                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                    <div style={{
                                        flex: 1, height: 5, borderRadius: "999px", background: "#e2e8f0", overflow: "hidden",
                                    }}>
                                        <div style={{
                                            width: `${pct}%`, height: "100%",
                                            background: isComplete ? "linear-gradient(90deg, #22c55e, #16a34a)" : theme.bg,
                                            borderRadius: "999px",
                                            transition: "width 0.5s ease",
                                        }} />
                                    </div>
                                    <span style={{
                                        fontSize: "0.75rem", fontWeight: 700,
                                        color: isComplete ? "#16a34a" : theme.accent,
                                        flexShrink: 0,
                                    }}>
                                        {doneTasks}/{totalTasks}
                                    </span>
                                </div>
                            </div>

                            {/* Chevron */}
                            <div style={{
                                width: 28, height: 28, borderRadius: "8px",
                                background: isOpen ? theme.light : "#f8fafc",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: isOpen ? theme.accent : "#94a3b8",
                                fontSize: "0.8rem",
                                transition: "all 0.25s",
                                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                flexShrink: 0,
                            }}>
                                ▼
                            </div>
                        </div>

                        {/* Expanded tasks */}
                        {isOpen && step.tasks && (
                            <div style={{
                                borderTop: `1px solid ${theme.border}`,
                                background: theme.light,
                                padding: "1rem 1.25rem",
                                animation: "fadeIn 0.2s ease",
                            }}>
                                {step.tasks.length === 0 ? (
                                    <div style={{ color: "#94a3b8", fontSize: "0.88rem", fontStyle: "italic", textAlign: "center", padding: "0.5rem 0" }}>
                                        Aucune tâche pour cette étape.
                                    </div>
                                ) : (
                                    step.tasks.map((task) => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            onToggle={(taskId, done) => handleTaskToggle(step.id, taskId, done)}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
