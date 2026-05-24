import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "../styles/events.css";

const categories = ["tous", "accueil", "immigration", "emploi", "rencontre", "integration"];
const periods = ["à venir", "cette semaine", "ce mois"];

export default function Events() {
    const [events, setEvents] = useState([]);
    const [filters, setFilters] = useState({ search: "", category: "tous", type: "tous", period: "à venir", campus: "" });
    const [view, setView] = useState("cartes");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/events/")
            .then((res) => setEvents(res.data.results || res.data || []))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const now = new Date();
        const weekLimit = new Date(now);
        weekLimit.setDate(now.getDate() + 7);
        const monthLimit = new Date(now);
        monthLimit.setMonth(now.getMonth() + 1);
        return events.filter((event) => {
            const date = new Date(event.start_date);
            const text = `${event.title} ${event.description} ${event.location} ${event.campus}`.toLowerCase();
            const matchesSearch = !filters.search.trim() || text.includes(filters.search.trim().toLowerCase());
            const matchesCategory = filters.category === "tous" || event.category === filters.category;
            const matchesType = filters.type === "tous" || (filters.type === "online" ? event.is_online : !event.is_online);
            const matchesCampus = !filters.campus.trim() || `${event.campus || ""} ${event.location || ""}`.toLowerCase().includes(filters.campus.trim().toLowerCase());
            const matchesPeriod = filters.period === "cette semaine" ? date <= weekLimit : filters.period === "ce mois" ? date <= monthLimit : date >= new Date(now.toDateString());
            return matchesSearch && matchesCategory && matchesType && matchesCampus && matchesPeriod;
        }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    }, [events, filters]);

    const nextEvent = filtered[0];
    const grouped = useMemo(() => groupEvents(filtered), [filtered]);

    function updateFilter(key, value) {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }

    return (
        <main className="events-page">
            <section className="events-hero">
                <div>
                    <span>Vie universitaire</span>
                    <h1>Calendrier des événements d'intégration</h1>
                    <p>Découvre les activités utiles pour mieux t'intégrer, rencontrer d'autres étudiants et participer à la vie universitaire.</p>
                    <div className="events-hero-actions">
                        <button type="button" onClick={() => updateFilter("period", "à venir")}>Voir les événements à venir</button>
                        <button type="button">Mes événements</button>
                    </div>
                </div>
                <aside>
                    <strong>{filtered.length}</strong>
                    <span>événement{filtered.length > 1 ? "s" : ""} à venir</span>
                    <p>{nextEvent ? `Prochain : ${new Date(nextEvent.start_date).toLocaleDateString("fr-CA")}` : "Aucune date à afficher"}</p>
                </aside>
            </section>

            <section className="events-filters">
                <input value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} placeholder="Rechercher un événement..." />
                <select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}>
                    {categories.map((category) => <option key={category} value={category}>{category === "tous" ? "Toutes les catégories" : category}</option>)}
                </select>
                <select value={filters.type} onChange={(e) => updateFilter("type", e.target.value)}>
                    <option value="tous">Tous les types</option>
                    <option value="online">En ligne</option>
                    <option value="presentiel">Présentiel</option>
                </select>
                <select value={filters.period} onChange={(e) => updateFilter("period", e.target.value)}>
                    {periods.map((period) => <option key={period} value={period}>{period}</option>)}
                </select>
                <input value={filters.campus} onChange={(e) => updateFilter("campus", e.target.value)} placeholder="Campus ou ville" />
                <button type="button" onClick={() => setFilters({ search: "", category: "tous", type: "tous", period: "à venir", campus: "" })}>Réinitialiser</button>
            </section>

            <div className="events-view-tabs">
                {["cartes", "calendrier", "liste"].map((item) => <button key={item} className={view === item ? "active" : ""} type="button" onClick={() => setView(item)}>Vue {item}</button>)}
            </div>

            {loading ? <div className="events-loading">Chargement...</div> : (
                filtered.length === 0 ? <EventsEmpty /> : (
                    view === "cartes" ? (
                        <section className="events-grid">{filtered.map((event) => <EventCard key={event.id} event={event} />)}</section>
                    ) : view === "calendrier" ? (
                        <section className="events-timeline">
                            {Object.entries(grouped).map(([label, items]) => (
                                <div className="events-date-group" key={label}>
                                    <h2>{label}</h2>
                                    {items.map((event) => <EventListItem key={event.id} event={event} />)}
                                </div>
                            ))}
                        </section>
                    ) : (
                        <section className="events-list">{filtered.map((event) => <EventListItem key={event.id} event={event} />)}</section>
                    )
                )
            )}
        </main>
    );
}

function EventCard({ event }) {
    const date = new Date(event.start_date);
    return (
        <article className="event-card">
            <div className="event-card-top">
                <span className={`event-category ${event.category}`}>{event.category_label || event.category}</span>
                <span className="event-mode">{event.is_online ? "En ligne" : "Présentiel"}</span>
            </div>
            <time>{date.toLocaleDateString("fr-CA", { day: "2-digit", month: "long", year: "numeric" })}</time>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <div className="event-meta">
                <span>{date.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}</span>
                <span>{event.location || event.campus || "Lieu à confirmer"}</span>
                <span>{event.university_name || "Ouvert aux étudiants"}{event.campus ? ` · ${event.campus}` : ""}</span>
            </div>
            <div className="event-actions">
                <button type="button">Voir détails</button>
                <button type="button">Participer</button>
            </div>
        </article>
    );
}

function EventListItem({ event }) {
    const date = new Date(event.start_date);
    return (
        <article className="event-list-item">
            <time><strong>{date.toLocaleDateString("fr-CA", { day: "2-digit" })}</strong><span>{date.toLocaleDateString("fr-CA", { month: "short" })}</span></time>
            <div>
                <span className={`event-category ${event.category}`}>{event.category_label || event.category}</span>
                <h3>{event.title}</h3>
                <p>{date.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })} · {event.location || "Lieu à confirmer"}</p>
            </div>
            <button type="button">Participer</button>
        </article>
    );
}

function EventsEmpty() {
    return (
        <section className="events-empty">
            <div>📅</div>
            <h2>Aucun événement ne correspond à ces filtres</h2>
            <p>Essaie d'élargir ta recherche ou de consulter tous les événements à venir.</p>
        </section>
    );
}

function groupEvents(events) {
    return events.reduce((acc, event) => {
        const label = new Date(event.start_date).toLocaleDateString("fr-CA", { weekday: "long", day: "2-digit", month: "long" });
        acc[label] = acc[label] || [];
        acc[label].push(event);
        return acc;
    }, {});
}
