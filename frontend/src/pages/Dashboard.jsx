import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import api from "../services/api";
import { logout } from "../services/auth";
import RequestItem from "../components/RequestItem";
import MenteeProfileModal from "../components/MenteeProfileModal";
import "../styles/dashboard.css";

const NAV_ITEMS = [
    {
        title: "Principal",
        items: [
            { to: "/dashboard", label: "Tableau de bord", icon: "home", roles: ["student", "mentor", "admin"] },
            { to: "/parcours", label: "Parcours", icon: "compass", roles: ["student", "admin"] },
            { to: "/checklist", label: "Checklist", icon: "check", roles: ["student", "admin"] },
        ],
    },
    {
        title: "Accompagnement",
        items: [
            { to: "/mentors", label: "Mentors", icon: "users", roles: ["student", "admin"] },
            { to: "/conversations", label: "Messages", icon: "mail", roles: ["student", "mentor", "admin"] },
            { to: "/mentors/rendez-vous", label: "Rendez-vous", icon: "calendar", roles: ["student", "mentor", "admin"] },
            { to: "/dashboard", label: "Ã‰tudiants accompagnÃ©s", icon: "users", roles: ["mentor"] },
            { to: "/evenements", label: "Ã‰vÃ©nements", icon: "calendar", roles: ["student", "mentor", "admin"] },
        ],
    },
    {
        title: "Outils Ã©tudiants",
        items: [
            { to: "/budget", label: "Budget", icon: "wallet", roles: ["student", "admin"] },
            { to: "/assistant", label: "IA", icon: "bot", roles: ["student", "admin"] },
            { to: "/carte", label: "Carte", icon: "pin", roles: ["student", "admin"] },
        ],
    },
    {
        title: "Ressources",
        items: [
            { to: "/university", label: "UniversitÃ©", icon: "school", roles: ["student", "admin"] },
            { to: "/study-success", label: "Guides", icon: "book", roles: ["student", "admin"] },
            { to: "/glossary", label: "Glossaire", icon: "book", roles: ["student", "admin"] },
            { to: "/study-success", label: "Ressources", icon: "book", roles: ["mentor"] },
        ],
    },
    {
        title: "Administration",
        items: [
            { to: "/admin", label: "Admin", icon: "shield", roles: ["admin"] },
        ],
    },
];

const QUICK_ACTIONS = [
    { to: "/assistant", label: "Poser une question à NordikBot", icon: "bot" },
    { to: "/parcours", label: "Changer mon étape", icon: "send" },
    { to: "/checklist", label: "Voir ma checklist", icon: "check" },
    { to: "/mentors", label: "Contacter un mentor", icon: "users" },
    { to: "/evenements", label: "Voir les événements", icon: "calendar" },
    { to: "/budget", label: "Modifier mon budget", icon: "wallet" },
    { to: "/carte", label: "Ouvrir la carte", icon: "map" },
    { to: "/university", label: "Université", icon: "school" },
    { to: "/study-success", label: "Réussite académique", icon: "book" },
    { to: "/glossary", label: "Glossaire", icon: "book" },
];

const ACADEMIC_SHORTCUTS = [
    { to: "/study-success#credits", label: "Système de crédits", detail: "Comprendre crédits, cours et charge de session", icon: "book" },
    { to: "/study-success#evaluations", label: "Évaluations & notes", detail: "Lire les plans de cours et suivre les examens", icon: "document" },
    { to: "/study-success#methodes", label: "Méthodes d'étude", detail: "Organiser ses révisions et son rythme de travail", icon: "bolt" },
    { to: "/glossary?search=NAS", label: "NAS", detail: "Définition et contexte administratif", icon: "document" },
    { to: "/glossary?search=CAQ", label: "CAQ", detail: "Comprendre ce document d'immigration", icon: "document" },
    { to: "/glossary?search=registrariat", label: "Registrariat", detail: "Savoir quand contacter ce service", icon: "school" },
];

export default function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [mentorRequests, setMentorRequests] = useState([]);
    const [selectedMentee, setSelectedMentee] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        async function fetchDashboard() {
            try {
                const res = await api.get("/dashboard/");
                if (!mounted) return;
                setDashboard(res.data);

                if (res.data?.profile?.role === "mentor") {
                    const requestsRes = await api.get("/auth/mentor-requests/");
                    if (mounted) {
                        setMentorRequests(requestsRes.data.filter((req) => req.status === "pending"));
                    }
                }
            } catch (err) {
                console.error("Dashboard data fetch error:", err);
                if (mounted) setError("Impossible de charger le tableau de bord pour le moment.");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchDashboard();
        return () => {
            mounted = false;
        };
    }, []);

    async function handleRequestAction(requestId, action) {
        try {
            await api.post(`/auth/mentor-requests/${requestId}/respond/`, { action });
            setMentorRequests((prev) => prev.filter((request) => request.id !== requestId));
        } catch (err) {
            console.error("Mentor request action error:", err);
            alert("Erreur lors de la rÃ©ponse Ã  la demande.");
        }
    }

    async function handleViewProfile(menteeId) {
        try {
            const res = await api.get(`/auth/mentee-profile/${menteeId}/`);
            setSelectedMentee(res.data);
        } catch (err) {
            console.error("Mentee profile fetch error:", err);
            alert("Erreur lors du chargement du profil.");
        }
    }

    function handleSidebarNavigate() {
        if (window.innerWidth <= 860) {
            setSidebarOpen(false);
        }
    }

    if (loading) {
        return (
            <div className="premium-dashboard dashboard-loading">
                <div className="dashboard-spinner" />
                <p>Chargement du tableau de bord...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="premium-dashboard dashboard-loading">
                <div className="dashboard-error">{error}</div>
            </div>
        );
    }

    if (!dashboard) return null;

    const role = dashboard.profile?.role === "admin" ? "admin" : dashboard.profile?.role || "student";
    const isMentor = role === "mentor";

    return (
        <div className={`premium-dashboard ${sidebarOpen ? "" : "sidebar-hidden"}`}>
            <button className="dashboard-sidebar-toggle" type="button" onClick={() => setSidebarOpen((value) => !value)} aria-label="Ouvrir ou fermer le menu">
                <span />
                <span />
                <span />
            </button>
            <DashboardSidebar role={role} open={sidebarOpen} onClose={handleSidebarNavigate} onToggle={() => setSidebarOpen((value) => !value)} />
            <main className="dashboard-main">
                <DashboardTopbar dashboard={dashboard} />

                {isMentor ? (
                    <MentorDashboard
                        dashboard={dashboard}
                        mentorRequests={mentorRequests}
                        onAction={handleRequestAction}
                        onViewProfile={handleViewProfile}
                    />
                ) : (
                    <StudentDashboard dashboard={dashboard} />
                )}
            </main>

            <MenteeProfileModal profile={selectedMentee} onClose={() => setSelectedMentee(null)} />
        </div>
    );
}

function StudentDashboard({ dashboard }) {
    return (
        <>
            <HeroBanner dashboard={dashboard} />

            <section className="dashboard-grid dashboard-grid-top">
                <ProgressCard progress={dashboard.progress} />
                <StageCard stage={dashboard.current_stage} />
                <CampusInfoCard campusInfo={dashboard.campus_info} universityId={dashboard.profile?.university_id} />
            </section>

            <section className="dashboard-grid dashboard-grid-bottom">
                <TasksCard tasks={dashboard.important_tasks} />
                <GuidesCard guides={dashboard.recommended_guides} />
                <MessagesCard messages={dashboard.mentor_messages} />
            </section>

            <section className="dashboard-grid dashboard-grid-bottom">
                <EventsMiniCard events={dashboard.upcoming_events} />
                <BudgetMiniCard budget={dashboard.budget} />
                <AppointmentsMiniCard appointments={dashboard.mentor_appointments} />
            </section>

            <QuickActionsCard actions={QUICK_ACTIONS} />
            <AcademicShortcutsCard />
        </>
    );
}

function MentorDashboard({ dashboard, mentorRequests, onAction, onViewProfile }) {
    return (
        <>
            <HeroBanner dashboard={dashboard} subtitle="Voici ton espace mentor pour accompagner les Ã©tudiants." />
            <section className="premium-card mentor-card">
                <CardHeader icon="users" title="Demandes de mentorat" />
                {mentorRequests.length > 0 ? (
                    <div className="mentor-request-list">
                        {mentorRequests.map((request) => (
                            <RequestItem
                                key={request.id}
                                request={request}
                                onAction={onAction}
                                onViewProfile={onViewProfile}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="mail"
                        title="Aucune demande en attente"
                        text="Les nouvelles demandes de mentorat apparaÃ®tront ici."
                    />
                )}
            </section>
            <QuickActionsCard
                actions={[
                    { to: "/conversations", label: "Voir mes messages", icon: "mail" },
                    { to: "/assistant", label: "Poser une question Ã  NordikBot", icon: "bot" },
                    { to: "/glossary", label: "Consulter le glossaire", icon: "book" },
                ]}
            />
        </>
    );
}

function DashboardSidebar({ role, open, onClose, onToggle }) {
    const groups = NAV_ITEMS
        .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role)) }))
        .filter((group) => group.items.length > 0);

    return (
        <aside className={`dashboard-sidebar open ${open ? "" : "compact"}`}>
            <div className="dashboard-sidebar-head">
            <Link to="/dashboard" className="dashboard-logo" onClick={onClose} title="NouveauDÃ©part">
                <span className="dashboard-logo-mark"><Icon name="school" /></span>
                <span>NouveauDÃ©part</span>
            </Link>
                <button className="dashboard-collapse-button" type="button" onClick={onToggle} title={open ? "RÃ©duire le menu" : "Agrandir le menu"} aria-label={open ? "RÃ©duire le menu" : "Agrandir le menu"}>
                    <Icon name="menu" />
                </button>
            </div>

            <nav className="dashboard-nav">
                {groups.map((group) => (
                    <div className="dashboard-nav-group" key={group.title}>
                        <div className="dashboard-nav-title">{group.title}</div>
                        {group.items.map((item) => (
                            <NavLink key={`${group.title}-${item.label}`} to={item.to} title={item.label} onClick={onClose} className={({ isActive }) => `dashboard-nav-link ${isActive ? "active" : ""}`}>
                                <Icon name={item.icon} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-motivation">
                <div className="motivation-visual">
                    <span />
                    <span />
                    <span />
                </div>
                <strong>Votre succÃ¨s commence ici.</strong>
                <p>Nous sommes lÃ  pour vous accompagner Ã  chaque Ã©tape de votre parcours au QuÃ©bec.</p>
            </div>
        </aside>
    );
}

function DashboardTopbar({ dashboard }) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const menuRef = useRef(null);
    const user = dashboard.user || {};
    const profile = dashboard.profile || {};
    const email = user.email || "";
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
    const displayName = fullName || email || "Utilisateur";
    const role = profile.role || user.role || "student";
    const roleLabel = role === "admin" ? "Administrateur" : role === "mentor" ? "Mentor" : "Etudiant international";
    const initial = (displayName[0] || "N").toUpperCase();
    const avatarUrl = profile.avatar_url || user.avatar_url;
    const personalActions = role === "admin"
        ? [
            { to: "/onboarding", label: "Mon profil", icon: "user" },
            { to: "/admin", label: "Administration", icon: "shield" },
            { to: "/onboarding", label: "Mes preferences", icon: "settings" },
        ]
        : role === "mentor"
            ? [
                { to: "/onboarding", label: "Mon profil", icon: "user" },
                { to: "/mentors/rendez-vous", label: "Mes rendez-vous", icon: "calendar" },
                { to: "/onboarding", label: "Mes preferences", icon: "settings" },
            ]
            : [
                { to: "/onboarding", label: "Mon profil", icon: "user" },
                { to: "/parcours", label: "Changer mon etape", icon: "compass" },
                { to: "/onboarding", label: "Mes preferences", icon: "settings" },
            ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setNotifOpen(false);
                setProfileOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                setNotifOpen(false);
                setProfileOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    return (
        <header className="dashboard-topbar">
            <div />
            <div className="dashboard-user-zone premium-user-zone" ref={menuRef}>
                <button
                    className={`notification-button premium-notification ${notifOpen ? "open" : ""}`}
                    type="button"
                    aria-label="Notifications"
                    aria-expanded={notifOpen}
                    onClick={() => {
                        setNotifOpen((value) => !value);
                        setProfileOpen(false);
                    }}
                >
                    <Icon name="bell" />
                    <span />
                </button>
                {notifOpen && (
                    <div className="dashboard-dropdown notification-dropdown premium-notification-dropdown" role="status">
                        <div className="dropdown-kicker">Centre de notifications</div>
                        <strong>Tout est calme pour le moment.</strong>
                        <p>Les rappels importants, messages mentors et activites a venir apparaitront ici.</p>
                        <Link to="/parcours" onClick={() => setNotifOpen(false)}>Voir mon parcours</Link>
                    </div>
                )}
                <button
                    className={`user-chip premium-user-chip ${profileOpen ? "open" : ""}`}
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    onClick={() => {
                        setProfileOpen((value) => !value);
                        setNotifOpen(false);
                    }}
                >
                    <div className="user-avatar premium-user-avatar">
                        {avatarUrl ? <img src={avatarUrl} alt="" /> : initial}
                    </div>
                    <span className="user-chip-text">
                        <strong>{fullName || email || "Mon espace"}</strong>
                        <small>{roleLabel}</small>
                    </span>
                    <span className="user-chip-chevron"><Icon name="chevron" /></span>
                </button>
                {profileOpen && (
                    <div className="dashboard-dropdown profile-dropdown premium-profile-dropdown" role="menu">
                        <div className="profile-menu-header">
                            <div className="user-avatar profile-menu-avatar">
                                {avatarUrl ? <img src={avatarUrl} alt="" /> : initial}
                            </div>
                            <div>
                                <strong>{displayName}</strong>
                                <p>{email}</p>
                                <span>{roleLabel}</span>
                            </div>
                        </div>
                        <div className="profile-menu-section">
                            {personalActions.map((action) => (
                                <Link key={action.label} className="profile-menu-item" to={action.to} role="menuitem" onClick={() => setProfileOpen(false)}>
                                    <span><Icon name={action.icon} /></span>
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                        <div className="profile-menu-section">
                            <Link className="profile-menu-item" to="/assistant" role="menuitem" onClick={() => setProfileOpen(false)}>
                                <span><Icon name="help" /></span>
                                Aide / Support
                            </Link>
                        </div>
                        <div className="profile-menu-divider" />
                        <button className="profile-menu-item logout-item" type="button" role="menuitem" onClick={logout}>
                            <span><Icon name="logout" /></span>
                            Se deconnecter
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
function HeroBanner({ dashboard, subtitle }) {
    const fullName = [dashboard.user?.first_name, dashboard.user?.last_name].filter(Boolean).join(" ").trim();
    const displayName = fullName || "cher Ã©tudiant";
    const university = dashboard.profile?.university || "UniversitÃ© non renseignÃ©e";
    const campus = dashboard.profile?.campus || "Campus non renseignÃ©";

    return (
        <section className="dashboard-hero">
            <div className="hero-content">
                <div className="hero-kicker">Espace Ã©tudiant NouveauDÃ©part</div>
                <h1>Bonjour <span>{displayName}</span>, bienvenue dans ton espace personnel.</h1>
                <p>{subtitle || "Voici ce qui est important pour avancer dans ton intÃ©gration."}</p>
                <div className="hero-badges">
                    <span><Icon name="school" /> UniversitÃ© : {university}</span>
                    <span><Icon name="pin" /> Campus : {campus}</span>
                </div>
            </div>
            <div className="hero-illustration" aria-hidden="true">
                <div className="quebec-flag">
                    <span />
                    <span />
                    <span />
                    <span />
                </div>
                <div className="skyline" />
            </div>
        </section>
    );
}

function ProgressCard({ progress }) {
    const percentage = progress?.percentage || 0;
    const completed = progress?.completed_tasks || 0;
    const total = progress?.total_tasks || 0;

    return (
        <section className="premium-card progress-card">
            <CardHeader title="Progression dâ€™intÃ©gration" />
            <div className="progress-card-body">
                <ProgressRing value={percentage} />
                <div>
                    <div className="metric-value">{percentage} %</div>
                    <div className="metric-row">
                        <span>{completed} tÃ¢che(s) complÃ©tÃ©e(s)</span>
                        <strong>{total} au total</strong>
                    </div>
                </div>
            </div>
            <div className="progress-divider" />
            <p className="card-help">
                {completed > 0
                    ? `Tu as complÃ©tÃ© ${percentage} % de ton parcours dâ€™intÃ©gration.`
                    : "Tu peux commencer ton parcours en complÃ©tant ta premiÃ¨re checklist."}
            </p>
        </section>
    );
}

function StageCard({ stage }) {
    return (
        <section className="premium-card stage-card">
            <CardHeader title="Mon Ã©tape actuelle" />
            <div className="stage-card-body">
                <div className="large-icon"><Icon name="send" /></div>
                <div>
                    <div className="stage-title">{stage?.title || "Ã‰tape non choisie"}</div>
                    <p>Tu es actuellement dans lâ€™Ã©tape : {stage?.title || "non dÃ©finie"}.</p>
                </div>
            </div>
            <Link className="premium-button primary" to="/parcours">
                Changer mon Ã©tape <Icon name="arrow" />
            </Link>
        </section>
    );
}

function CampusInfoCard({ campusInfo, universityId }) {
    const university = campusInfo?.university || "UniversitÃ© non renseignÃ©e";
    const campus = campusInfo?.campus || "Campus non renseignÃ©";
    const services = campusInfo?.services || [];
    const to = universityId ? `/university/${universityId}` : "/university";

    return (
        <section className="premium-card campus-card">
            <CardHeader title="Informations campus" />
            <InfoRow label="UniversitÃ©" value={university} />
            <InfoRow label="Campus" value={campus} />
            <div className="services-block">
                <span>Services utiles</span>
                <div className="service-tags">
                    {services.map((service) => <span key={service}>{service}</span>)}
                </div>
            </div>
            <Link className="premium-button outline" to={to}>
                <Icon name="external" /> Voir les informations du campus <Icon name="arrow" />
            </Link>
        </section>
    );
}

function TasksCard({ tasks }) {
    return (
        <section className="premium-card list-card">
            <CardHeader icon="check" title="TÃ¢ches importantes" />
            <div className="task-list">
                {tasks?.length ? (
                    tasks.slice(0, 5).map((task) => <TaskItem key={`${task.source || "task"}-${task.id}`} task={task} />)
                ) : (
                    <EmptyState icon="check" title="Aucune tÃ¢che prioritaire" text="Ton parcours apparaÃ®tra ici dÃ¨s que des tÃ¢ches seront disponibles." />
                )}
            </div>
            <Link className="card-link" to="/checklist">Voir toutes les tÃ¢ches <Icon name="arrow" /></Link>
        </section>
    );
}

function TaskItem({ task }) {
    const done = task.status === "complÃ©tÃ©";
    const destination = task.source === "stage" ? "/parcours" : "/checklist";

    return (
        <Link to={destination} className="task-item">
            <div className="task-icon"><Icon name={done ? "check" : "document"} /></div>
            <div>
                <strong>{task.title}</strong>
                <span>{task.category || "Parcours"}</span>
            </div>
            <em className={done ? "done" : ""}>{done ? "ComplÃ©tÃ©" : "Ã€ faire"}</em>
            <Icon name="chevron" />
        </Link>
    );
}

function GuidesCard({ guides }) {
    return (
        <section className="premium-card list-card">
            <CardHeader icon="book" title="Guides recommandÃ©s" />
            <div className="guide-list">
                {guides?.length ? (
                    guides.slice(0, 3).map((guide) => (
                        <Link key={guide.id} className="guide-item" to={guideDestination(guide)}>
                            <div className="guide-icon"><Icon name="book" /></div>
                            <div>
                                <strong>{guide.title}</strong>
                                <span>{guide.category}</span>
                            </div>
                            <Icon name="chevron" />
                        </Link>
                    ))
                ) : (
                    <EmptyState icon="book" title="Aucun guide recommandÃ©" text="Les guides adaptÃ©s Ã  ton profil apparaÃ®tront ici." />
                )}
            </div>
            <Link className="card-link" to="/study-success">Voir tous les guides <Icon name="arrow" /></Link>
        </section>
    );
}

function guideDestination(guide) {
    const text = `${guide?.title || ""} ${guide?.category || ""}`.toLowerCase();
    if (text.includes("crédit") || text.includes("credit")) return "/study-success#credits";
    if (text.includes("note") || text.includes("évaluation") || text.includes("evaluation")) return "/study-success#evaluations";
    if (text.includes("méthode") || text.includes("methode") || text.includes("étude") || text.includes("etude")) return "/study-success#methodes";
    if (text.includes("calendrier") || text.includes("organisation")) return "/study-success#organisation";
    if (text.includes("aide") || text.includes("mentor")) return "/study-success#aide";
    if (text.includes("plagiat") || text.includes("intégrité") || text.includes("integrite")) return "/study-success#integrite";
    return "/study-success";
}

function MessagesCard({ messages }) {
    return (
        <section className="premium-card messages-card">
            <CardHeader icon="mail" title="Messages mentors" />
            {messages?.length ? (
                <div className="message-list">
                    {messages.slice(0, 3).map((message) => (
                        <Link key={message.id} className="message-item" to={`/chat/${message.id}`}>
                            <strong>{message.mentor_name}</strong>
                            <span>{message.last_message}</span>
                        </Link>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="chat"
                    title="Tu nâ€™as pas encore de message."
                    text="Tu peux contacter un mentor pour obtenir de lâ€™aide."
                />
            )}
            <Link className="premium-button primary compact" to="/conversations">
                Voir mes messages <Icon name="arrow" />
            </Link>
        </section>
    );
}

function EventsMiniCard({ events }) {
    return (
        <section className="premium-card list-card">
            <CardHeader icon="calendar" title="Ã‰vÃ©nements Ã  venir" />
            <div className="guide-list">
                {events?.length ? events.map((event) => (
                    <Link key={event.id} className="guide-item" to="/evenements">
                        <div className="guide-icon"><Icon name="calendar" /></div>
                        <div>
                            <strong>{event.title}</strong>
                            <span>{new Date(event.date).toLocaleDateString("fr-CA")} Â· {event.location}</span>
                        </div>
                        <Icon name="chevron" />
                    </Link>
                )) : <EmptyState icon="calendar" title="Aucun Ã©vÃ©nement Ã  venir" text="Les activitÃ©s utiles apparaÃ®tront ici." />}
            </div>
            <Link className="card-link" to="/evenements">Voir tous les Ã©vÃ©nements <Icon name="arrow" /></Link>
        </section>
    );
}

function BudgetMiniCard({ budget }) {
    return (
        <section className="premium-card messages-card">
            <CardHeader icon="wallet" title="Mon budget Ã©tudiant" />
            {budget ? (
                <div className="empty-state">
                    <div className="metric-value">{Number(budget.monthly_total).toFixed(0)} $</div>
                    <p>Budget mensuel estimÃ©</p>
                </div>
            ) : (
                <EmptyState icon="wallet" title="Tu nâ€™as pas encore estimÃ© ton budget." text="Ajoute tes dÃ©penses pour mieux prÃ©voir ton mois." />
            )}
            <Link className="premium-button primary compact" to="/budget">Modifier mon budget <Icon name="arrow" /></Link>
        </section>
    );
}

function AppointmentsMiniCard({ appointments }) {
    const next = appointments?.next;
    return (
        <section className="premium-card messages-card">
            <CardHeader icon="calendar" title="Mes rendez-vous mentors" />
            {next ? (
                <div className="message-item">
                    <strong>{next.mentor_name}</strong>
                    <span>{next.date} Ã  {next.start_time} Â· {next.status}</span>
                </div>
            ) : (
                <EmptyState icon="calendar" title="Tu nâ€™as pas encore de rendez-vous avec un mentor." text="RÃ©serve un moment pour obtenir un accompagnement direct." />
            )}
            <Link className="premium-button primary compact" to="/mentors/rendez-vous">RÃ©server un rendez-vous <Icon name="arrow" /></Link>
        </section>
    );
}

function QuickActionsCard({ actions }) {
    return (
        <section className="premium-card quick-actions-card">
            <CardHeader icon="bolt" title="Actions rapides" />
            <div className="quick-actions-grid">
                {actions.map((action) => (
                    <Link key={`${action.to}-${action.label}`} to={action.to} className="quick-action">
                        <span><Icon name={action.icon} /></span>
                        <strong>{action.label}</strong>
                    </Link>
                ))}
            </div>
        </section>
    );
}

function AcademicShortcutsCard() {
    return (
        <section className="premium-card academic-shortcuts-card">
            <CardHeader icon="book" title="Ressources académiques utiles" />
            <div className="academic-shortcuts-grid">
                {ACADEMIC_SHORTCUTS.map((item) => (
                    <Link key={item.to} to={item.to} className="academic-shortcut">
                        <span><Icon name={item.icon} /></span>
                        <div>
                            <strong>{item.label}</strong>
                            <small>{item.detail}</small>
                        </div>
                        <Icon name="arrow" />
                    </Link>
                ))}
            </div>
        </section>
    );
}

function CardHeader({ icon, title }) {
    return (
        <div className="card-header">
            {icon && <span className="card-header-icon"><Icon name={icon} /></span>}
            <h2>{title}</h2>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="info-row">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

function ProgressRing({ value }) {
    const safeValue = Math.max(0, Math.min(100, value));
    return (
        <div className="progress-ring" style={{ "--progress": `${safeValue * 3.6}deg` }}>
            <div />
        </div>
    );
}

function EmptyState({ icon, title, text }) {
    return (
        <div className="empty-state">
            <div className="empty-illustration"><Icon name={icon} /></div>
            <strong>{title}</strong>
            <p>{text}</p>
        </div>
    );
}

function Icon({ name }) {
    const paths = {
        home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3v-10.5Z",
        compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2.1 5-5 2.1 2.1-5 5-2.1Z",
        check: "M20 6 9 17l-5-5",
        school: "M3 8.5 12 4l9 4.5-9 4.5L3 8.5Zm4 3.5v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V12",
        users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
        mail: "M4 5h16v14H4V5Zm0 2 8 6 8-6",
        bot: "M12 8V4m0 4h5a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3h5Zm-4 5h.01M16 13h.01M9 17h6",
        pin: "M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
        bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4",
        chevron: "m9 18 6-6-6-6",
        arrow: "M5 12h14m-6-6 6 6-6 6",
        send: "M22 2 11 13m11-11-7 20-4-9-9-4 20-7Z",
        external: "M14 3h7v7m-1-6L10 14M5 7v12h12",
        document: "M6 3h9l5 5v13H6V3Zm9 0v5h5",
        book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Zm0 0V21",
        chat: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z",
        map: "M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6",
        bolt: "M13 2 3 14h8l-1 8 10-12h-8l1-8Z",
        calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
        wallet: "M3 7h18v12H3V7Zm3-4h12v4H6V3Zm12 10h.01",
        user: "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
        logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9",
        shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
        settings: "M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Zm8.5-3.5a6.8 6.8 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L16 3.5h-4L11.7 6a8 8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a6.8 6.8 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1l.3 2.5h4l.3-2.5a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1Z",
        help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5h.01M9.8 9a2.3 2.3 0 1 1 3.8 1.8c-.9.6-1.6 1.1-1.6 2.2",
        menu: "M4 6h16M4 12h16M4 18h16",
    };

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={paths[name] || paths.home} />
        </svg>
    );
}

