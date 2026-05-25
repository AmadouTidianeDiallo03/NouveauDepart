import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

const CONFIG = {
    guides: {
        title: "Guides",
        endpoint: "/admin/guides/",
        fields: ["title", "category", "description", "order"],
        columns: ["id", "title", "category", "order"],
    },
    checklists: {
        title: "Checklists",
        endpoint: "/admin/checklists/",
        fields: ["stage", "title", "description", "priority", "category", "order"],
        columns: ["id", "title", "stage_title", "priority", "category"],
    },
    universities: {
        title: "Universités",
        endpoint: "/admin/universities/",
        fields: ["name", "city", "website_url", "latitude", "longitude"],
        columns: ["id", "name", "city", "website_url"],
    },
    "map-points": {
        title: "Carte",
        endpoint: "/admin/map-points/",
        fields: ["university", "name", "category", "address", "latitude", "longitude", "description"],
        columns: ["id", "name", "category", "university_name", "address"],
    },
    events: {
        title: "Événements",
        endpoint: "/admin/events/",
        fields: ["title", "category", "university", "campus", "location", "start_date", "end_date", "description"],
        columns: ["id", "title", "category", "campus", "start_date"],
    },
    "knowledge-base": {
        title: "Base IA",
        endpoint: "/admin/knowledge-base/",
        fields: ["title", "path", "category", "university", "campus", "language", "source_url", "updated_at_text", "description", "content"],
        columns: ["id", "title", "category", "university", "chunks_count"],
    },
    feedbacks: {
        title: "Feedbacks",
        endpoint: "/admin/feedbacks/",
        readOnly: true,
        fields: [],
        columns: ["id", "user_email", "rating", "question", "created_at"],
    },
    mentors: {
        title: "Mentors",
        endpoint: "/admin/mentors/",
        fields: ["university", "campus", "city", "country_origin", "languages", "program", "study_level", "help_topics", "specialties", "availability_status", "is_active", "is_verified"],
        columns: ["id", "full_name", "university_name", "country_origin", "availability_status", "is_active"],
    },
    "uqar-sources": {
        title: "Sources UQAR",
        endpoint: "/admin/uqar-sources/",
        fields: ["key", "title", "url", "category", "keywords"],
        columns: ["id", "title", "category", "url", "keywords"],
    },
};

const NAV = [
    ["dashboard", "Dashboard admin"],
    ["guides", "Guides"],
    ["checklists", "Checklists"],
    ["universities", "Universités"],
    ["map-points", "Carte"],
    ["events", "Événements"],
    ["mentors", "Mentors"],
    ["knowledge-base", "Base IA"],
    ["uqar-sources", "Sources UQAR"],
    ["feedbacks", "Feedbacks"],
];

export default function AdminPanel() {
    const { user } = useAuth();
    const { section = "dashboard" } = useParams();

    if (user?.role !== "admin") {
        return (
            <div className="admin-page">
                <div className="admin-denied">Accès refusé. Cette section est réservée aux administrateurs.</div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <Link to="/admin" className="admin-brand">NouveauDépart Admin</Link>
                {NAV.map(([key, label]) => (
                    <NavLink key={key} to={key === "dashboard" ? "/admin" : `/admin/${key}`} className={({ isActive }) => `admin-link ${isActive || section === key ? "active" : ""}`}>
                        {label}
                    </NavLink>
                ))}
            </aside>
            <main className="admin-main">
                {section === "dashboard" ? <AdminDashboard /> : <AdminResource config={CONFIG[section]} />}
            </main>
        </div>
    );
}

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    useEffect(() => { api.get("/admin/stats/").then((res) => setStats(res.data)); }, []);
    const cards = stats ? [
        ["Utilisateurs", stats.users],
        ["Guides", stats.guides],
        ["Checklists", stats.checklists],
        ["Universités", stats.universities],
        ["Points carte", stats.map_points],
        ["Événements", stats.events],
        ["Mentors", stats.mentors],
        ["Feedbacks", stats.feedbacks],
    ] : [];

    return (
        <>
            <AdminHeader title="Dashboard administrateur" desc="Centre de gestion du contenu NouveauDépart." />
            <div className="admin-stats">
                {cards.map(([label, value]) => <div className="admin-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}
            </div>
            <div className="admin-quick">
                <Link to="/admin/guides">Ajouter un guide</Link>
                <Link to="/admin/universities">Ajouter une université</Link>
                <Link to="/admin/map-points">Ajouter un point carte</Link>
                <Link to="/admin/events">Ajouter un événement</Link>
                <Link to="/admin/knowledge-base">Modifier la base IA</Link>
            </div>
        </>
    );
}

function AdminResource({ config }) {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({});
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState("");

    const fields = config?.fields || [];

    async function load() {
        const res = await api.get(config.endpoint);
        setItems(res.data.results || res.data);
    }

    useEffect(() => {
        if (config) load();
    }, [config?.endpoint]);

    if (!config) return <AdminHeader title="Section introuvable" desc="Cette section admin n’existe pas." />;

    async function save(e) {
        e.preventDefault();
        setError("");
        try {
            const payload = normalizePayload(form);
            if (editing) await api.put(`${config.endpoint}${editing}/`, payload);
            else await api.post(config.endpoint, payload);
            setForm({});
            setEditing(null);
            await load();
        } catch (err) {
            setError(JSON.stringify(err.response?.data || err.message));
        }
    }

    async function remove(id) {
        if (!confirm("Supprimer cet élément ?")) return;
        await api.delete(`${config.endpoint}${id}/`);
        await load();
    }

    function edit(item) {
        setEditing(item.id);
        setForm(item);
    }

    async function reindex() {
        await api.post("/admin/knowledge-base/reindex/");
        alert("Réindexation lancée.");
    }

    return (
        <>
            <AdminHeader title={config.title} desc="Créer, modifier et maintenir le contenu de la plateforme." />
            {error && <div className="admin-error">{error}</div>}
            {!config.readOnly && (
                <form className="admin-form" onSubmit={save}>
                    {fields.map((field) => (
                        <label key={field}>
                            {field}
                            {field === "description" || field === "content" ? (
                                <textarea value={form[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
                            ) : (
                                <input value={form[field] ?? ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
                            )}
                        </label>
                    ))}
                    <div className="admin-form-actions">
                        <button>{editing ? "Enregistrer" : "Ajouter"}</button>
                        {editing && <button type="button" onClick={() => { setEditing(null); setForm({}); }}>Annuler</button>}
                        {config.endpoint.includes("knowledge-base") && <button type="button" onClick={reindex}>Réindexer</button>}
                    </div>
                </form>
            )}
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr>{config.columns.map((c) => <th key={c}>{c}</th>)}{!config.readOnly && <th>Actions</th>}</tr></thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                {config.columns.map((c) => <td key={c}>{formatCell(item[c])}</td>)}
                                {!config.readOnly && <td><button onClick={() => edit(item)}>Modifier</button><button onClick={() => remove(item.id)}>Supprimer</button></td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

function AdminHeader({ title, desc }) {
    return (
        <section className="admin-header">
            <h1>{title}</h1>
            <p>{desc}</p>
        </section>
    );
}

function normalizePayload(form) {
    const payload = {};
    Object.entries(form).forEach(([key, value]) => {
        if (["id", "created_at", "updated_at", "indexed_at", "stage_title", "university_name", "chunks_count", "content_hash"].includes(key)) return;
        if (value === "") payload[key] = null;
        else payload[key] = value;
    });
    return payload;
}

function formatCell(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value).slice(0, 90);
}
