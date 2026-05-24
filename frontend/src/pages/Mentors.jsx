import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/mentors.css";

const HELP_TOPICS = [
    "Logement",
    "Transport",
    "Vie universitaire",
    "Démarches administratives",
    "Budget",
    "Emploi étudiant",
    "Intégration culturelle",
    "Études",
    "Vie sociale",
];

const COUNTRY_OPTIONS = ["Côte d’Ivoire", "Sénégal", "Cameroun", "Maroc", "Tunisie", "France", "Haïti", "Algérie", "Canada", "Autre"];

const EMPTY_FILTERS = {
    search: "",
    university_id: "",
    city: "",
    country_origin: "",
    language: "",
    program: "",
    help_topic: "",
    availability_status: "",
};

export default function Mentors() {
    const { user } = useAuth();
    const [mentors, setMentors] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/universities/").then((response) => setUniversities(response.data.results || response.data)).catch(() => setUniversities([]));
        api.get("/auth/mentors/recommended/").then((response) => setRecommended(response.data.results || response.data)).catch(() => setRecommended([]));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchMentors(filters), 250);
        return () => clearTimeout(timer);
    }, [filters]);

    async function fetchMentors(currentFilters) {
        setLoading(true);
        setError("");
        try {
            const params = Object.fromEntries(Object.entries(currentFilters).filter(([, value]) => value));
            const response = await api.get("/auth/mentors/", { params });
            setMentors(response.data.results || response.data);
        } catch (err) {
            console.error("Mentors loading error:", err);
            setError("Impossible de charger les mentors pour le moment.");
        } finally {
            setLoading(false);
        }
    }

    function setFilter(name, value) {
        setFilters((current) => ({ ...current, [name]: value }));
    }

    function resetFilters() {
        setFilters(EMPTY_FILTERS);
    }

    const recommendedIds = useMemo(() => new Set(recommended.map((mentor) => mentor.id)), [recommended]);
    const resultLabel = filters.country_origin
        ? `Mentors venant de : ${filters.country_origin}`
        : `${mentors.length} mentor${mentors.length > 1 ? "s" : ""} disponible${mentors.length > 1 ? "s" : ""}`;

    return (
        <div className="mentors-page">
            <section className="mentors-hero">
                <div className="mentors-hero-content">
                    <span>Accompagnement humain</span>
                    <h1>Trouver un mentor</h1>
                    <p>Connecte-toi avec un étudiant expérimenté qui peut t’accompagner dans ton intégration au Québec.</p>
                    <p className="hero-note">Tu peux filtrer les mentors par université, langue, pays d’origine ou domaine d’aide.</p>
                    <a href="#recommended" className="hero-button">Voir les mentors recommandés</a>
                </div>
                <div className="mentors-hero-visual" aria-hidden="true">
                    <div />
                    <span />
                    <span />
                </div>
            </section>

            <main className="mentors-container">
                <MentorFilters
                    filters={filters}
                    universities={universities}
                    onChange={setFilter}
                    onReset={resetFilters}
                />

                {!!recommended.length && (
                    <section className="mentors-section" id="recommended">
                        <SectionHeader
                            eyebrow="Sélection personnalisée"
                            title="Mentors recommandés pour toi"
                            description="Ces profils ressortent selon ton université, ta ville, ta langue ou ton parcours."
                        />
                        <div className="recommended-row">
                            {recommended.slice(0, 3).map((mentor) => (
                                <MentorCard key={mentor.id} mentor={mentor} recommended sameCountry={sameCountry(user, mentor)} compact />
                            ))}
                        </div>
                    </section>
                )}

                <section className="mentors-section">
                    <div className="results-head">
                        <div>
                            <span>Résultats</span>
                            <h2>{resultLabel}</h2>
                        </div>
                        <p>{Object.values(filters).some(Boolean) ? "Tes critères sont appliqués." : "Affichage de tous les mentors actifs."}</p>
                    </div>

                    {loading ? (
                        <div className="mentors-loading"><div className="mentors-spinner" />Chargement des mentors...</div>
                    ) : error ? (
                        <div className="mentors-empty"><strong>{error}</strong></div>
                    ) : mentors.length ? (
                        <div className="mentors-grid">
                            {mentors.map((mentor) => (
                                <MentorCard
                                    key={mentor.id}
                                    mentor={mentor}
                                    recommended={recommendedIds.has(mentor.id)}
                                    sameCountry={sameCountry(user, mentor)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState onReset={resetFilters} />
                    )}
                </section>

                <WhyMentorSection />
            </main>
        </div>
    );
}

function MentorFilters({ filters, universities, onChange, onReset }) {
    return (
        <section className="mentor-filters">
            <div className="mentor-search">
                <Icon name="search" />
                <input
                    value={filters.search}
                    onChange={(event) => onChange("search", event.target.value)}
                    placeholder="Rechercher un mentor par nom, pays, programme ou domaine d’aide..."
                />
            </div>
            <select value={filters.university_id} onChange={(event) => onChange("university_id", event.target.value)}>
                <option value="">Université</option>
                {universities.map((university) => <option key={university.id} value={university.id}>{university.name}</option>)}
            </select>
            <input value={filters.city} onChange={(event) => onChange("city", event.target.value)} placeholder="Campus ou ville" />
            <select value={filters.country_origin} onChange={(event) => onChange("country_origin", event.target.value)}>
                <option value="">Pays d’origine</option>
                {COUNTRY_OPTIONS.map((country) => <option key={country} value={country}>{country}</option>)}
            </select>
            <select value={filters.language} onChange={(event) => onChange("language", event.target.value)}>
                <option value="">Langue</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
            </select>
            <input value={filters.program} onChange={(event) => onChange("program", event.target.value)} placeholder="Programme d’études" />
            <select value={filters.help_topic} onChange={(event) => onChange("help_topic", event.target.value)}>
                <option value="">Domaine d’aide</option>
                {HELP_TOPICS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
            </select>
            <select value={filters.availability_status} onChange={(event) => onChange("availability_status", event.target.value)}>
                <option value="">Disponibilité</option>
                <option value="Disponible">Disponible</option>
                <option value="Disponibilités à confirmer">Disponibilités à confirmer</option>
            </select>
            <button type="button" onClick={onReset}>Réinitialiser les filtres</button>
        </section>
    );
}

function MentorCard({ mentor, recommended, sameCountry: hasSameCountry, compact = false }) {
    const navigate = useNavigate();
    const fullName = mentor.full_name || `${mentor.first_name || ""} ${mentor.last_name || ""}`.trim() || mentor.email;
    const initials = fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    const topics = mentor.help_topics?.length ? mentor.help_topics : splitList(mentor.specialties || "Vie universitaire,Démarches");
    const languages = mentor.languages?.length ? mentor.languages : [mentor.language === "en" ? "English" : "Français"];

    async function sendMessage() {
        try {
            const response = await api.post("/chat/conversations/", { mentor_id: mentor.id });
            navigate(`/chat/${response.data.id}`);
        } catch (err) {
            console.error("Conversation creation error:", err);
        }
    }

    return (
        <article className={`mentor-profile-card ${compact ? "compact" : ""}`}>
            <div className="mentor-card-top">
                <div className="mentor-avatar">
                    {mentor.avatar_url ? <img src={mentor.avatar_url} alt="" /> : initials}
                </div>
                <div>
                    <div className="mentor-name-row">
                        <h3>{fullName}</h3>
                        {mentor.is_verified && <span className="verified-badge">Vérifié</span>}
                    </div>
                    <p>{mentor.university?.name || "Université non indiquée"} {mentor.campus ? `· ${mentor.campus}` : ""}</p>
                </div>
            </div>

            <div className="mentor-badges">
                <span>Mentor</span>
                {recommended && <span className="recommend">Recommandé pour toi</span>}
                {hasSameCountry && <span className="country-match">Même pays d’origine</span>}
                <span className="compat">{mentor.compatibility || "Peut aider"}</span>
            </div>

            <div className="mentor-meta-grid">
                <Meta icon="flag" label="Pays d’origine" value={mentor.country_origin || "Non indiqué"} />
                <Meta icon="pin" label="Ville" value={mentor.city || "Québec"} />
                <Meta icon="book" label="Programme" value={mentor.program || "Non précisé"} />
                <Meta icon="globe" label="Langues" value={languages.join(", ")} />
            </div>

            <div className="topic-tags">
                {topics.slice(0, compact ? 3 : 5).map((topic) => <span key={topic}>{topic}</span>)}
            </div>

            <p className="mentor-bio">{mentor.bio || mentor.profile?.bio || "Ce mentor peut t’aider à mieux comprendre ton arrivée et ta vie universitaire au Québec."}</p>

            <div className="mentor-status">
                <span className={mentor.availability_status?.toLowerCase().includes("disponible") ? "available" : ""} />
                {mentor.availability_status || "Disponibilités à confirmer"}
            </div>

            <div className="mentor-actions">
                <Link to={`/mentors/${mentor.id}`}>Voir le profil</Link>
                <button type="button" onClick={sendMessage}>Envoyer un message</button>
                <Link to={`/mentors/rendez-vous?mentor_id=${mentor.id}`} className="secondary">Prendre rendez-vous</Link>
            </div>
        </article>
    );
}

function Meta({ icon, label, value }) {
    return (
        <div>
            <span><Icon name={icon} /> {label}</span>
            <strong>{value}</strong>
        </div>
    );
}

function SectionHeader({ eyebrow, title, description }) {
    return (
        <div className="mentors-section-head">
            <span>{eyebrow}</span>
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    );
}

function WhyMentorSection() {
    const items = [
        "Poser des questions sur l’université",
        "Comprendre les premières démarches",
        "Obtenir des conseils pratiques",
        "Éviter l’isolement",
        "Mieux s’intégrer à la vie étudiante",
    ];
    return (
        <section className="why-mentor">
            <SectionHeader
                eyebrow="Pourquoi contacter un mentor ?"
                title="Un accompagnement humain, concret et rassurant"
                description="Un mentor ne remplace pas les services officiels, mais il peut t’aider à mieux comprendre les étapes et à te sentir moins seul."
            />
            <div>
                {items.map((item) => (
                    <div key={item}><Icon name="check" /> {item}</div>
                ))}
            </div>
        </section>
    );
}

function EmptyState({ onReset }) {
    return (
        <div className="mentors-empty">
            <Icon name="search" />
            <strong>Aucun mentor ne correspond à tes critères pour le moment.</strong>
            <p>Tu peux réinitialiser les filtres, élargir la recherche ou contacter un mentor général.</p>
            <button type="button" onClick={onReset}>Réinitialiser les filtres</button>
        </div>
    );
}

function sameCountry(user, mentor) {
    const userCountry = user?.profile?.country_origin;
    return Boolean(userCountry && mentor.country_origin && userCountry.toLowerCase() === mentor.country_origin.toLowerCase());
}

function splitList(value) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function Icon({ name }) {
    const paths = {
        search: "M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z",
        flag: "M5 21V4h11l1 4-1 4H5",
        pin: "M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
        book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Zm0 0V21",
        globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2-2.3 3-5.3 3-9s-1-6.7-3-9m0 18c-2-2.3-3-5.3-3-9s1-6.7 3-9M3.6 9h16.8M3.6 15h16.8",
        check: "M20 6 9 17l-5-5",
    };

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={paths[name] || paths.check} />
        </svg>
    );
}
