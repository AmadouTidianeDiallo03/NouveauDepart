import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/welcome.css";

const STORY_CARDS = [
    {
        icon: "grid",
        title: "Simplifier les démarches",
        text: "Regrouper les informations utiles en un seul endroit pour éviter que l'étudiant se perde entre plusieurs plateformes.",
    },
    {
        icon: "users",
        title: "Accompagner humainement",
        text: "Combiner l'aide de mentors avec des outils numériques pour offrir un soutien plus proche de la réalité étudiante.",
    },
    {
        icon: "compass",
        title: "Guider étape par étape",
        text: "Aider l'étudiant avant son arrivée, à son arrivée et après son installation avec des repères simples.",
    },
];

const FEATURES = [
    { icon: "home", title: "Tableau de bord", text: "Visualise tes priorités, ton profil et les actions importantes.", to: "/dashboard" },
    { icon: "compass", title: "Suivre mon parcours", text: "Avance selon ton étape : avant, à l'arrivée ou après ton installation.", to: "/parcours" },
    { icon: "check", title: "Compléter ma checklist", text: "Garde une vue claire sur les démarches importantes à faire.", to: "/checklist" },
    { icon: "users", title: "Contacter un mentor", text: "Échange avec une personne qui connaît déjà le parcours.", to: "/mentors" },
    { icon: "spark", title: "Événements", text: "Découvre les activités utiles pour t'intégrer à la vie universitaire.", to: "/evenements" },
    { icon: "wallet", title: "Estimer mon budget", text: "Prévois tes dépenses mensuelles au Québec plus simplement.", to: "/budget" },
    { icon: "bot", title: "NordikBot", text: "Pose tes questions sur l'université, les démarches et la vie au Québec.", to: "/assistant" },
    { icon: "map", title: "Explorer la carte", text: "Repère campus, services, transport et lieux essentiels.", to: "/carte" },
    { icon: "book", title: "Lire les guides", text: "Comprends les démarches avec des ressources simples et utiles.", to: "/study-success" },
];

const JOURNEY_STEPS = [
    {
        icon: "plane",
        title: "Avant mon arrivée",
        text: "Préparer mes documents, mon budget, mon logement et mon départ.",
        tasks: ["Admission", "CAQ et permis", "Budget", "Logement"],
    },
    {
        icon: "home",
        title: "À mon arrivée",
        text: "Faire mes premières démarches, découvrir mon campus et m'installer.",
        tasks: ["Téléphone", "Banque", "Transport", "Campus"],
    },
    {
        icon: "star",
        title: "Après mon arrivée",
        text: "M'intégrer, réussir mes études, trouver de l'aide et participer à la vie universitaire.",
        tasks: ["Études", "Mentors", "Événements", "Vie sociale"],
    },
];

const STATS = [
    { value: "3", label: "étapes de parcours" },
    { value: "36+", label: "tâches pratiques" },
    { value: "7+", label: "mentors disponibles" },
    { value: "15+", label: "ressources utiles" },
    { value: "24/7", label: "NordikBot" },
];

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Bon matin";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
}

function normalizeName(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return value.name || value.title || value.short_name || "";
    return "";
}

function getRoleLabel(role) {
    if (role === "admin") return "Administrateur";
    if (role === "mentor") return "Mentor";
    return "Étudiant international";
}

export default function Welcome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const storyRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setVisible(true), 120);
        return () => clearTimeout(timeout);
    }, []);

    const profile = user?.profile || {};
    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    const displayName = fullName || user?.email || "Profil à compléter";
    const roleLabel = getRoleLabel(profile.role);
    const university = normalizeName(profile.university_info) || normalizeName(profile.university) || "Université non sélectionnée";
    const campus = normalizeName(profile.campus_info) || normalizeName(profile.campus) || "Campus non défini";
    const stage = normalizeName(profile.integration_stage) || profile.integration_stage_display || "Profil à compléter";
    const avatarSrc = profile.avatar_url || user?.avatar_url;
    const initial = (firstName?.[0] || user?.email?.[0] || "N").toUpperCase();

    function scrollToStory() {
        storyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return (
        <main className={`welcome-page ${visible ? "is-visible" : ""}`}>
            <WelcomeHero
                avatarSrc={avatarSrc}
                initial={initial}
                greeting={getGreeting()}
                displayName={displayName}
                roleLabel={roleLabel}
                university={university}
                campus={campus}
                stage={stage}
                onDashboard={() => navigate("/dashboard")}
                onDiscover={scrollToStory}
            />
            <FeatureCardsSection />
            <ProjectStorySection sectionRef={storyRef} />
            <JourneyStepsSection />
            <HumanAISection />
            <WelcomeStatsSection />
            <WelcomeCTA onDashboard={() => navigate("/dashboard")} />
        </main>
    );
}

function WelcomeHero({ avatarSrc, initial, greeting, displayName, roleLabel, university, campus, stage, onDashboard, onDiscover }) {
    return (
        <section className="welcome-hero">
            <div className="welcome-hero-inner">
                <div className="welcome-hero-copy">
                    <div className="welcome-kicker">Accueil personnalisé</div>
                    <p className="welcome-greeting">{greeting}, {displayName.split(" ")[0]}</p>
                    <h1>Bienvenue sur ton espace NouveauDépart</h1>
                    <p className="welcome-lead">Ton guide intelligent pour réussir ton intégration au Québec.</p>
                    <p className="welcome-intro">
                        Retrouve ton parcours, tes ressources, tes mentors et les outils utiles pour t'accompagner étape par étape.
                    </p>
                    <div className="welcome-actions">
                        <button type="button" className="welcome-primary-btn" onClick={onDashboard}>Accéder à mon tableau de bord</button>
                        <button type="button" className="welcome-secondary-btn" onClick={onDiscover}>Découvrir le projet</button>
                    </div>
                </div>

                <UserSummaryCard
                    avatarSrc={avatarSrc}
                    initial={initial}
                    displayName={displayName}
                    roleLabel={roleLabel}
                    university={university}
                    campus={campus}
                    stage={stage}
                />
            </div>
        </section>
    );
}

function UserSummaryCard({ avatarSrc, initial, displayName, roleLabel, university, campus, stage }) {
    return (
        <aside className="welcome-user-card" aria-label="Résumé du profil">
            <div className="welcome-user-card-header">
                <div className="welcome-avatar">
                    {avatarSrc ? <img src={avatarSrc} alt="" /> : initial}
                </div>
                <div>
                    <span>Profil connecté</span>
                    <h2>{displayName}</h2>
                    <p>{roleLabel}</p>
                </div>
            </div>
            <div className="welcome-user-details">
                <div>
                    <span>Université</span>
                    <strong>{university}</strong>
                </div>
                <div>
                    <span>Campus</span>
                    <strong>{campus}</strong>
                </div>
                <div>
                    <span>Étape actuelle</span>
                    <strong>{stage}</strong>
                </div>
            </div>
            <Link to="/onboarding">Compléter mon profil</Link>
        </aside>
    );
}

function ProjectStorySection({ sectionRef }) {
    return (
        <section className="welcome-section welcome-story-section" ref={sectionRef}>
            <div className="welcome-section-heading">
                <span>Un projet né d'un besoin réel</span>
                <h2>Pourquoi NouveauDépart ?</h2>
                <p>
                    NouveauDépart a été pensé pour aider les étudiants internationaux à mieux comprendre leur arrivée,
                    à s'organiser et à trouver plus facilement les bonnes ressources au bon moment.
                </p>
            </div>
            <div className="welcome-story-grid">
                {STORY_CARDS.map((card) => (
                    <article className="welcome-story-card" key={card.title}>
                        <span><WelcomeIcon name={card.icon} /></span>
                        <h3>{card.title}</h3>
                        <p>{card.text}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

function FeatureCardsSection() {
    return (
        <section className="welcome-section">
            <div className="welcome-section-heading">
                <span>Fonctionnalités</span>
                <h2>Ce que tu peux faire avec NouveauDépart</h2>
                <p>Chaque fonctionnalité a été pensée pour répondre à un besoin concret de l'étudiant international.</p>
            </div>
            <div className="welcome-feature-grid">
                {FEATURES.map((feature) => (
                    <Link className="welcome-feature-card" to={feature.to} key={feature.title}>
                        <span><WelcomeIcon name={feature.icon} /></span>
                        <h3>{feature.title}</h3>
                        <p>{feature.text}</p>
                        <strong>Ouvrir</strong>
                    </Link>
                ))}
            </div>
        </section>
    );
}

function JourneyStepsSection() {
    return (
        <section className="welcome-section welcome-journey-section">
            <div className="welcome-section-heading">
                <span>Ton parcours</span>
                <h2>Trois étapes pour mieux te situer</h2>
                <p>NouveauDépart adapte les tâches et les ressources selon le moment où tu te trouves dans ton intégration.</p>
            </div>
            <div className="welcome-journey-grid">
                {JOURNEY_STEPS.map((step, index) => (
                    <article className="welcome-journey-card" key={step.title}>
                        <div className="journey-index">0{index + 1}</div>
                        <span><WelcomeIcon name={step.icon} /></span>
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                        <div className="journey-tags">
                            {step.tasks.map((task) => <small key={task}>{task}</small>)}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

function HumanAISection() {
    return (
        <section className="welcome-human-ai">
            <div className="welcome-human-heading">
                <span>Technologie et accompagnement</span>
                <h2>Un soutien humain et intelligent</h2>
                <p>
                    NouveauDépart combine technologie et accompagnement humain pour proposer une expérience plus utile
                    et plus rassurante.
                </p>
            </div>
            <div className="welcome-support-grid">
                <article>
                    <span><WelcomeIcon name="bot" /></span>
                    <h3>NordikBot</h3>
                    <p>Obtiens rapidement des réponses à tes questions sur l'université, les démarches et la vie au Québec.</p>
                    <Link to="/assistant">Poser une question</Link>
                </article>
                <article>
                    <span><WelcomeIcon name="users" /></span>
                    <h3>Mentors</h3>
                    <p>Échange avec des étudiants expérimentés qui peuvent t'aider à mieux t'intégrer.</p>
                    <Link to="/mentors">Trouver un mentor</Link>
                </article>
            </div>
        </section>
    );
}

function WelcomeStatsSection() {
    return (
        <section className="welcome-stats">
            {STATS.map((stat) => (
                <div key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                </div>
            ))}
        </section>
    );
}

function WelcomeCTA({ onDashboard }) {
    return (
        <section className="welcome-cta">
            <h2>Prêt à continuer ton intégration ?</h2>
            <p>Ton espace NouveauDépart est prêt. Continue ton parcours, complète tes étapes et utilise les ressources disponibles.</p>
            <div className="welcome-cta-actions">
                <button type="button" className="welcome-primary-btn" onClick={onDashboard}>Accéder à mon tableau de bord</button>
                <Link className="welcome-outline-link" to="/onboarding">Compléter mon profil</Link>
            </div>
        </section>
    );
}

function WelcomeIcon({ name }) {
    const paths = {
        heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
        grid: "M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z",
        users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
        compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2.1 5-5 2.1 2.1-5 5-2.1Z",
        check: "M20 6 9 17l-5-5",
        bot: "M12 8V4m0 4h5a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3h5Zm-4 5h.01M16 13h.01M9 17h6",
        calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
        spark: "M12 2l1.6 5.3L19 9l-5.4 1.7L12 16l-1.6-5.3L5 9l5.4-1.7L12 2Zm6 12 .8 2.7L21 18l-2.2.7L18 21l-.8-2.3L15 18l2.2-1.3L18 14Z",
        wallet: "M3 7h18v12H3V7Zm3-4h12v4H6V3Zm12 10h.01",
        map: "M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6",
        book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Zm0 0V21",
        plane: "M22 2 11 13m11-11-7 20-4-9-9-4 20-7Z",
        home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3v-10.5Z",
        star: "m12 2 3 6 6 .9-4.5 4.4 1.1 6.4L12 16.7 6.4 19.7l1.1-6.4L3 8.9 9 8l3-6Z",
    };

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={paths[name] || paths.star} />
        </svg>
    );
}
