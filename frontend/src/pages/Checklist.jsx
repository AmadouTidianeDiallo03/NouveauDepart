import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/checklist.css";

const CATEGORY_META = {
    admin: {
        label: "Démarches administratives",
        icon: "document",
        color: "#f59e0b",
        gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    },
    university: {
        label: "Vie universitaire",
        icon: "school",
        color: "#2563eb",
        gradient: "linear-gradient(135deg, #2563eb, #6366f1)",
    },
    transport: {
        label: "Se déplacer",
        icon: "pin",
        color: "#7c3aed",
        gradient: "linear-gradient(135deg, #7c3aed, #ec4899)",
    },
    housing: {
        label: "Logement & Installation",
        icon: "home",
        color: "#059669",
        gradient: "linear-gradient(135deg, #10b981, #059669)",
    },
    lifestyle: {
        label: "Vie au Québec",
        icon: "spark",
        color: "#ea580c",
        gradient: "linear-gradient(135deg, #f97316, #fbbf24)",
    },
    work: {
        label: "Trouver du travail",
        icon: "briefcase",
        color: "#334155",
        gradient: "linear-gradient(135deg, #0f172a, #334155)",
    },
    default: {
        label: "Parcours",
        icon: "check",
        color: "#475569",
        gradient: "linear-gradient(135deg, #64748b, #475569)",
    },
};

const STAGE_LABELS = {
    before_arrival: "Avant mon arrivée",
    arrival: "À mon arrivée",
    after_arrival: "Après mon arrivée",
};

const QUICK_ACTIONS = [
    { to: "/parcours", label: "Voir mon parcours", icon: "compass" },
    { to: "/assistant", label: "Poser une question à NordikBot", icon: "bot" },
    { to: "/mentors", label: "Contacter un mentor", icon: "users" },
    { to: "/study-success", label: "Consulter les guides", icon: "book" },
    { to: "/evenements", label: "Voir les événements", icon: "calendar" },
    { to: "/carte", label: "Ouvrir la carte", icon: "pin" },
];

export default function Checklist() {
    const [steps, setSteps] = useState([]);
    const [progress, setProgress] = useState(null);
    const [stage, setStage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openSteps, setOpenSteps] = useState({});
    const [filters, setFilters] = useState({
        search: "",
        category: "all",
        status: "all",
        stage: "all",
    });

    useEffect(() => {
        let mounted = true;

        async function loadChecklist() {
            setLoading(true);
            setError("");
            try {
                const [stepsRes, progressRes, stageRes] = await Promise.allSettled([
                    api.get("/guides/steps/"),
                    api.get("/guides/progress/"),
                    api.get("/integration-stages/current/"),
                ]);

                if (!mounted) return;
                if (stepsRes.status !== "fulfilled" || progressRes.status !== "fulfilled") {
                    throw new Error("Checklist loading failed");
                }

                const stepsData = stepsRes.value.data.results || stepsRes.value.data;
                const withTasks = await Promise.all(
                    stepsData.map(async (step) => {
                        const response = await api.get(`/guides/steps/${step.id}/tasks/`);
                        return { ...step, tasks: response.data.tasks || [] };
                    })
                );

                if (!mounted) return;
                setSteps(withTasks);
                setProgress(progressRes.value.data);
                setStage(stageRes.status === "fulfilled" ? stageRes.value.data?.current_stage : null);
                setOpenSteps(withTasks.length ? { [withTasks[0].id]: true } : {});
            } catch (err) {
                console.error("Checklist loading error:", err);
                if (mounted) setError("Impossible de charger la checklist pour le moment.");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadChecklist();
        return () => {
            mounted = false;
        };
    }, []);

    const flattenedTasks = useMemo(() => {
        return steps.flatMap((step) =>
            (step.tasks || []).map((task) => ({
                ...task,
                stepId: step.id,
                stepTitle: step.title,
                category: step.category || "default",
                stageKey: inferStage(task, step),
            }))
        );
    }, [steps]);

    const stats = useMemo(() => buildStats(steps, progress, stage), [steps, progress, stage]);
    const filteredSteps = useMemo(() => filterSteps(steps, filters), [steps, filters]);
    const nextTask = flattenedTasks.find((task) => !task.done) || flattenedTasks[0];
    const recommendedTasks = flattenedTasks.filter((task) => !task.done).slice(0, 3);

    async function toggleTask(taskId) {
        try {
            const response = await api.post(`/guides/tasks/${taskId}/toggle/`);
            const done = response.data.done;
            setSteps((current) =>
                current.map((step) => ({
                    ...step,
                    tasks: (step.tasks || []).map((task) => (task.id === taskId ? { ...task, done } : task)),
                }))
            );
            setProgress((current) => updateProgress(current, steps, taskId, done));
        } catch (err) {
            console.error("Checklist toggle error:", err);
        }
    }

    function toggleStep(stepId) {
        setOpenSteps((current) => ({ ...current, [stepId]: !current[stepId] }));
    }

    function resetFilters() {
        setFilters({ search: "", category: "all", status: "all", stage: "all" });
    }

    if (loading) {
        return (
            <div className="checklist-page checklist-loading">
                <div className="checklist-spinner" />
                <p>Chargement de ta checklist...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="checklist-page checklist-loading">
                <div className="checklist-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="checklist-page">
            <ChecklistHero stats={stats} />

            <main className="checklist-container">
                <SummaryCards stats={stats} nextTask={nextTask} />
                <ChecklistFilters filters={filters} onChange={setFilters} onReset={resetFilters} steps={steps} />

                <section className="checklist-layout">
                    <div className="checklist-primary">
                        <CategoryOverview steps={steps} onOpen={(id) => setOpenSteps((current) => ({ ...current, [id]: true }))} />

                        <section className="checklist-section">
                            <div className="section-heading">
                                <div>
                                    <span>Suivi détaillé</span>
                                    <h2>Mes catégories et tâches</h2>
                                </div>
                                <p>{filteredSteps.reduce((count, step) => count + (step.tasks?.length || 0), 0)} tâche(s) affichée(s)</p>
                            </div>

                            {filteredSteps.length ? (
                                <div className="accordion-list">
                                    {filteredSteps.map((step) => (
                                        <CategoryAccordion
                                            key={step.id}
                                            step={step}
                                            open={Boolean(openSteps[step.id])}
                                            onToggle={() => toggleStep(step.id)}
                                            onTaskToggle={toggleTask}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon="search"
                                    title="Aucune tâche ne correspond aux filtres."
                                    text="Essaie de modifier ta recherche ou de réinitialiser les filtres."
                                    action={<button type="button" onClick={resetFilters}>Réinitialiser les filtres</button>}
                                />
                            )}
                        </section>
                    </div>

                    <aside className="checklist-aside">
                        <NextActionCard task={nextTask} onStart={() => nextTask && setOpenSteps((current) => ({ ...current, [nextTask.stepId]: true }))} />
                        <MilestonesCard percentage={stats.percentage} />
                        <RecommendationsCard tasks={recommendedTasks} />
                        <TipsCard />
                    </aside>
                </section>

                <QuickActionsCard />
            </main>
        </div>
    );
}

function ChecklistHero({ stats }) {
    return (
        <section className="checklist-hero">
            <div className="hero-grid">
                <div>
                    <div className="hero-label">Mon parcours d’intégration</div>
                    <h1>Ma Checklist</h1>
                    <p>Complète chaque étape à ton rythme pour réussir ton arrivée au Québec.</p>
                    <div className="motivation-message">{motivationMessage(stats.percentage)}</div>
                </div>
                <div className="hero-progress-card">
                    <ProgressDonut value={stats.percentage} />
                    <div>
                        <strong>{stats.done} tâche(s) complétée(s)</strong>
                        <span>sur {stats.total} au total</span>
                        <div className="hero-progress-bar"><span style={{ width: `${stats.percentage}%` }} /></div>
                    </div>
                </div>
            </div>
            <div className="hero-pattern" aria-hidden="true" />
        </section>
    );
}

function SummaryCards({ stats, nextTask }) {
    const cards = [
        { label: "Tâches complétées", value: stats.done, icon: "check" },
        { label: "Tâches restantes", value: Math.max(stats.total - stats.done, 0), icon: "document" },
        { label: "Étape actuelle", value: stats.stageLabel, icon: "compass" },
        { label: "Catégorie la plus avancée", value: stats.bestCategory || "À commencer", icon: "spark" },
        { label: "Prochaine priorité", value: nextTask?.title || "Aucune tâche", icon: "flag" },
    ];

    return (
        <section className="summary-grid">
            {cards.map((card) => (
                <div className="summary-card" key={card.label}>
                    <div className="summary-icon"><Icon name={card.icon} /></div>
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                </div>
            ))}
        </section>
    );
}

function ChecklistFilters({ filters, onChange, onReset, steps }) {
    const categories = [...new Set(steps.map((step) => step.category || "default"))];

    function setFilter(name, value) {
        onChange((current) => ({ ...current, [name]: value }));
    }

    return (
        <section className="filters-card">
            <div className="search-field">
                <Icon name="search" />
                <input
                    value={filters.search}
                    onChange={(event) => setFilter("search", event.target.value)}
                    placeholder="Rechercher une tâche, un document, un logement..."
                />
            </div>
            <select value={filters.category} onChange={(event) => setFilter("category", event.target.value)}>
                <option value="all">Toutes les catégories</option>
                {categories.map((category) => (
                    <option key={category} value={category}>{categoryMeta(category).label}</option>
                ))}
            </select>
            <select value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
                <option value="all">Tous les statuts</option>
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="done">Complétées</option>
            </select>
            <select value={filters.stage} onChange={(event) => setFilter("stage", event.target.value)}>
                <option value="all">Toutes les étapes</option>
                <option value="before_arrival">Avant mon arrivée</option>
                <option value="arrival">À mon arrivée</option>
                <option value="after_arrival">Après mon arrivée</option>
            </select>
            <button type="button" onClick={onReset}>Réinitialiser</button>
        </section>
    );
}

function CategoryOverview({ steps, onOpen }) {
    return (
        <section className="checklist-section">
            <div className="section-heading">
                <div>
                    <span>Vue d’ensemble</span>
                    <h2>Catégories de progression</h2>
                </div>
            </div>
            <div className="category-grid">
                {steps.map((step) => (
                    <CategoryCard key={step.id} step={step} onOpen={() => onOpen(step.id)} />
                ))}
            </div>
        </section>
    );
}

function CategoryCard({ step, onOpen }) {
    const meta = categoryMeta(step.category);
    const done = countDone(step.tasks);
    const total = step.tasks?.length || 0;
    const percentage = percent(done, total);

    return (
        <button className="category-card" type="button" onClick={onOpen} style={{ "--accent": meta.color }}>
            <div className="category-top">
                <span className="category-icon" style={{ background: meta.gradient }}><Icon name={meta.icon} /></span>
                <Icon name="chevron" />
            </div>
            <h3>{meta.label}</h3>
            <p>{done}/{total} tâche(s) complétée(s)</p>
            <div className="mini-progress"><span style={{ width: `${percentage}%`, background: meta.gradient }} /></div>
            <strong>{percentage} %</strong>
        </button>
    );
}

function CategoryAccordion({ step, open, onToggle, onTaskToggle }) {
    const meta = categoryMeta(step.category);
    const done = countDone(step.tasks);
    const total = step.tasks?.length || 0;
    const percentage = percent(done, total);
    const status = percentage === 100 ? "Complétée" : percentage > 0 ? "En cours" : "À faire";

    return (
        <article className={`category-accordion ${open ? "open" : ""}`}>
            <button className="accordion-head" type="button" onClick={onToggle}>
                <span className="accordion-icon" style={{ background: meta.gradient }}><Icon name={meta.icon} /></span>
                <div>
                    <h3>{meta.label}</h3>
                    <p>{done}/{total} tâche(s) · {percentage} %</p>
                </div>
                <em className={status === "Complétée" ? "done" : status === "En cours" ? "progress" : ""}>{status}</em>
                <Icon name="chevron" />
            </button>
            <div className="accordion-progress"><span style={{ width: `${percentage}%`, background: meta.gradient }} /></div>

            {open && (
                <div className="task-list">
                    {step.tasks?.length ? (
                        step.tasks.map((task) => (
                            <ChecklistTaskItem key={task.id} task={task} category={step.category} onToggle={() => onTaskToggle(task.id)} />
                        ))
                    ) : (
                        <EmptyState icon="document" title="Aucune tâche dans cette catégorie." text="Les tâches ajoutées apparaîtront ici." />
                    )}
                </div>
            )}
        </article>
    );
}

function ChecklistTaskItem({ task, category, onToggle }) {
    const [expanded, setExpanded] = useState(false);
    const details = task.how_to || task.tips || task.locations;
    const priority = inferPriority(task, category);
    const status = task.done ? "complétée" : details ? "en cours" : "à faire";

    return (
        <div className={`checklist-task ${task.done ? "done" : ""}`}>
            <button className="task-check" type="button" onClick={onToggle} aria-label={task.done ? "Marquer à faire" : "Marquer complétée"}>
                {task.done && <Icon name="check" />}
            </button>
            <div className="task-body">
                <div className="task-title-row">
                    <strong>{task.title}</strong>
                    <div className="task-badges">
                        <span className={`status-badge ${task.done ? "done" : "todo"}`}>{status}</span>
                        <span className={`priority-badge ${priority.key}`}>{priority.label}</span>
                    </div>
                </div>
                {task.description && <p>{task.description}</p>}
                {details && (
                    <button className="task-detail-button" type="button" onClick={() => setExpanded((value) => !value)}>
                        {expanded ? "Masquer le détail" : "Voir détail"} <Icon name="chevron" />
                    </button>
                )}
                {expanded && (
                    <div className="task-details">
                        {task.how_to && <DetailBlock title="Comment procéder" text={task.how_to} />}
                        {task.tips && <DetailBlock title="Conseil utile" text={task.tips} />}
                        {task.locations && <DetailBlock title="Où aller / liens" text={task.locations} />}
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailBlock({ title, text }) {
    return (
        <section>
            <strong>{title}</strong>
            <p>{text}</p>
        </section>
    );
}

function NextActionCard({ task, onStart }) {
    return (
        <section className="side-card next-action-card">
            <span className="side-kicker">Prochaine action recommandée</span>
            <h2>{task?.title || "Tout est à jour"}</h2>
            <p>{task?.description || "Tu n’as pas de tâche urgente pour le moment. Continue à consulter ton parcours régulièrement."}</p>
            {task && <button type="button" onClick={onStart}>Commencer cette tâche</button>}
        </section>
    );
}

function MilestonesCard({ percentage }) {
    const milestones = [
        { label: "Premier pas", value: 1 },
        { label: "25 %", value: 25 },
        { label: "50 %", value: 50 },
        { label: "75 %", value: 75 },
        { label: "Parcours complété", value: 100 },
    ];

    return (
        <section className="side-card">
            <span className="side-kicker">Jalons</span>
            <h2>Ton avancée</h2>
            <div className="milestone-list">
                {milestones.map((milestone) => (
                    <div className={percentage >= milestone.value ? "reached" : ""} key={milestone.label}>
                        <span><Icon name={percentage >= milestone.value ? "check" : "flag"} /></span>
                        <strong>{milestone.label}</strong>
                    </div>
                ))}
            </div>
        </section>
    );
}

function RecommendationsCard({ tasks }) {
    return (
        <section className="side-card">
            <span className="side-kicker">Recommandations</span>
            <h2>À faire ensuite</h2>
            <div className="recommendation-list">
                {tasks.length ? tasks.map((task) => (
                    <div key={task.id}>
                        <strong>{task.title}</strong>
                        <span>{categoryMeta(task.category).label}</span>
                    </div>
                )) : <p>Tu es bien avancé. Vérifie les catégories restantes pour finaliser ton parcours.</p>}
            </div>
        </section>
    );
}

function TipsCard() {
    return (
        <section className="side-card tips-card">
            <span className="side-kicker">Conseils utiles</span>
            <h2>Avance sans stress</h2>
            <ul>
                <li>Commence par les démarches administratives, souvent prioritaires.</li>
                <li>Si tu es bloqué, contacte un mentor ou pose une question à NordikBot.</li>
                <li>Utilise les guides pour mieux comprendre chaque étape.</li>
            </ul>
        </section>
    );
}

function QuickActionsCard() {
    return (
        <section className="quick-actions-card">
            <div className="section-heading">
                <div>
                    <span>Accès rapide</span>
                    <h2>Actions rapides</h2>
                </div>
            </div>
            <div className="quick-actions-grid">
                {QUICK_ACTIONS.map((action) => (
                    <Link key={action.to} to={action.to} className="quick-action">
                        <span><Icon name={action.icon} /></span>
                        <strong>{action.label}</strong>
                    </Link>
                ))}
            </div>
        </section>
    );
}

function ProgressDonut({ value }) {
    return (
        <div className="progress-donut" style={{ "--progress": `${value * 3.6}deg` }}>
            <div>{value}%</div>
        </div>
    );
}

function EmptyState({ icon, title, text, action }) {
    return (
        <div className="checklist-empty">
            <span><Icon name={icon} /></span>
            <strong>{title}</strong>
            <p>{text}</p>
            {action}
        </div>
    );
}

function buildStats(steps, progress, stage) {
    const total = progress?.total_tasks ?? steps.reduce((sum, step) => sum + (step.tasks?.length || 0), 0);
    const done = progress?.done_tasks ?? steps.reduce((sum, step) => sum + countDone(step.tasks), 0);
    const percentage = progress?.percentage ?? percent(done, total);
    const categories = steps.map((step) => ({
        title: categoryMeta(step.category).label,
        percentage: percent(countDone(step.tasks), step.tasks?.length || 0),
    }));
    const best = categories.sort((a, b) => b.percentage - a.percentage)[0];

    return {
        total,
        done,
        percentage,
        stageLabel: stage?.title || STAGE_LABELS[stage?.key] || "Avant mon arrivée",
        bestCategory: best?.percentage > 0 ? best.title : "",
    };
}

function filterSteps(steps, filters) {
    const query = filters.search.trim().toLowerCase();

    return steps
        .filter((step) => filters.category === "all" || step.category === filters.category)
        .map((step) => ({
            ...step,
            tasks: (step.tasks || []).filter((task) => {
                const haystack = `${task.title} ${task.description} ${step.title}`.toLowerCase();
                const matchesSearch = !query || haystack.includes(query);
                const matchesStatus =
                    filters.status === "all" ||
                    (filters.status === "done" && task.done) ||
                    (filters.status === "todo" && !task.done) ||
                    (filters.status === "in_progress" && !task.done && (task.how_to || task.tips || task.locations));
                const matchesStage = filters.stage === "all" || inferStage(task, step) === filters.stage;
                return matchesSearch && matchesStatus && matchesStage;
            }),
        }))
        .filter((step) => step.tasks.length > 0);
}

function updateProgress(current, steps, taskId, done) {
    if (!current) return current;
    const previousTask = steps.flatMap((step) => step.tasks || []).find((task) => task.id === taskId);
    if (!previousTask || previousTask.done === done) return current;

    const doneTasks = Math.max(0, current.done_tasks + (done ? 1 : -1));
    const total = Math.max(current.total_tasks, 1);
    return {
        ...current,
        done_tasks: doneTasks,
        percentage: Math.round((doneTasks / total) * 100),
        by_category: (current.by_category || []).map((cat) => {
            const step = steps.find((item) => item.id === previousTask.stepId || item.tasks?.some((task) => task.id === taskId));
            if (!step || cat.step_id !== step.id) return cat;
            return { ...cat, done: Math.max(0, cat.done + (done ? 1 : -1)) };
        }),
    };
}

function inferStage(task, step) {
    const text = `${task.title} ${task.description} ${step.title}`.toLowerCase();
    if (text.includes("arrivée") || text.includes("sim") || text.includes("banque") || text.includes("campus")) return "arrival";
    if (text.includes("emploi") || text.includes("travail") || text.includes("activité") || text.includes("réussite")) return "after_arrival";
    return "before_arrival";
}

function inferPriority(task, category) {
    const text = `${task.title} ${task.description}`.toLowerCase();
    if (category === "admin" || text.includes("caq") || text.includes("permis") || text.includes("admission") || text.includes("documents")) {
        return { key: "high", label: "haute" };
    }
    if (category === "housing" || category === "transport" || text.includes("logement") || text.includes("transport")) {
        return { key: "medium", label: "moyenne" };
    }
    return { key: "low", label: "basse" };
}

function categoryMeta(category) {
    return CATEGORY_META[category] || CATEGORY_META.default;
}

function countDone(tasks = []) {
    return tasks.filter((task) => task.done).length;
}

function percent(done, total) {
    return total ? Math.round((done / total) * 100) : 0;
}

function motivationMessage(percentage) {
    if (percentage >= 100) return "Félicitations, tu as complété ton parcours.";
    if (percentage >= 75) return "Excellent, tu es très proche de terminer ton parcours.";
    if (percentage >= 50) return "Très bon progrès, continue comme ça.";
    if (percentage >= 25) return "Bravo, tu avances bien dans ton intégration.";
    return "Tu peux commencer doucement par ta première étape.";
}

function Icon({ name }) {
    const paths = {
        home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3v-10.5Z",
        compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2.1 5-5 2.1 2.1-5 5-2.1Z",
        check: "M20 6 9 17l-5-5",
        school: "M3 8.5 12 4l9 4.5-9 4.5L3 8.5Zm4 3.5v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V12",
        users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
        bot: "M12 8V4m0 4h5a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3h5Zm-4 5h.01M16 13h.01M9 17h6",
        pin: "M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
        book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Zm0 0V21",
        calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
        document: "M6 3h9l5 5v13H6V3Zm9 0v5h5",
        briefcase: "M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14v13H5V6Zm0 5h14",
        spark: "M12 2l2.3 6.7L21 11l-6.7 2.3L12 20l-2.3-6.7L3 11l6.7-2.3L12 2Z",
        search: "M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z",
        chevron: "m9 18 6-6-6-6",
        flag: "M5 21V4h11l1 4-1 4H5",
        wallet: "M3 7h18v12H3V7Zm3-4h12v4H6V3Zm12 10h.01",
    };

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={paths[name] || paths.check} />
        </svg>
    );
}
