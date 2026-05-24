import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/messages.css";

const TABS = ["Toutes", "Non lues", "Mentors"];

function getName(user) {
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
    return fullName || user?.email || "Conversation";
}

function formatDate(dt) {
    if (!dt) return "";
    const d = new Date(dt);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    return d.toLocaleDateString("fr-CA", { day: "2-digit", month: "short" });
}

export default function Conversations() {
    const { user } = useAuth();
    const [convs, setConvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState("Toutes");
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        api.get("/chat/conversations/")
            .then((r) => {
                const data = r.data.results || r.data || [];
                setConvs(data);
                setSelectedId(data[0]?.id || null);
            })
            .finally(() => setLoading(false));
    }, []);

    const isMentor = user?.profile?.role === "mentor";
    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return convs.filter((conv) => {
            const name = getName(conv.other_user).toLowerCase();
            const last = conv.last_message?.content?.toLowerCase() || "";
            const matchesSearch = !normalized || name.includes(normalized) || last.includes(normalized);
            const unread = conv.unread_count || conv.has_unread;
            const matchesTab = tab === "Toutes" || (tab === "Non lues" ? unread : true);
            return matchesSearch && matchesTab;
        });
    }, [convs, query, tab]);
    const selected = filtered.find((conv) => conv.id === selectedId) || filtered[0] || null;

    if (loading) {
        return <div className="messages-page"><div className="messages-loading"><div className="spinner" />Chargement des messages...</div></div>;
    }

    return (
        <main className="messages-page">
            <section className="messages-hero">
                <div>
                    <span>Messagerie</span>
                    <h1>{isMentor ? "Mes mentorés" : "Mes Messages"}</h1>
                    <p>Retrouve ici tes échanges avec les mentors et les personnes qui t'accompagnent.</p>
                </div>
                <div className="messages-stats">
                    <strong>{convs.length}</strong>
                    <span>conversation{convs.length > 1 ? "s" : ""}</span>
                </div>
            </section>

            {convs.length === 0 ? (
                <EmptyInbox isMentor={isMentor} />
            ) : (
                <section className="messages-shell">
                    <aside className="conversation-panel">
                        <div className="conversation-tools">
                            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une conversation..." />
                            <Link to={isMentor ? "/dashboard" : "/mentors"}>{isMentor ? "Voir les demandes" : "Nouveau message"}</Link>
                        </div>
                        <div className="conversation-tabs">
                            {TABS.map((item) => (
                                <button key={item} className={tab === item ? "active" : ""} type="button" onClick={() => setTab(item)}>{item}</button>
                            ))}
                        </div>
                        <div className="conversation-list">
                            {filtered.length ? filtered.map((conv) => (
                                <button
                                    key={conv.id}
                                    type="button"
                                    className={`conversation-item ${selected?.id === conv.id ? "active" : ""}`}
                                    onClick={() => setSelectedId(conv.id)}
                                >
                                    <Avatar user={conv.other_user} />
                                    <div>
                                        <strong>{getName(conv.other_user)}</strong>
                                        <span>{conv.other_user?.profile?.role === "mentor" ? "Mentor" : "Étudiant"}</span>
                                        <p>{conv.last_message?.content || "Aucun message encore"}</p>
                                    </div>
                                    <time>{formatDate(conv.last_message?.created_at || conv.created_at)}</time>
                                    {(conv.unread_count || conv.has_unread) && <em />}
                                </button>
                            )) : (
                                <div className="conversation-empty">Aucune conversation ne correspond à ta recherche.</div>
                            )}
                        </div>
                    </aside>
                    <ConversationPreview conversation={selected} />
                </section>
            )}
        </main>
    );
}

function ConversationPreview({ conversation }) {
    if (!conversation) {
        return (
            <section className="message-preview empty">
                <div className="message-illustration">💬</div>
                <h2>Aucune conversation sélectionnée</h2>
                <p>Choisis une conversation existante ou contacte un mentor pour commencer.</p>
                <Link to="/mentors">Trouver un mentor</Link>
            </section>
        );
    }

    const other = conversation.other_user;
    const name = getName(other);
    return (
        <section className="message-preview">
            <header className="message-preview-header">
                <Avatar user={other} large />
                <div>
                    <h2>{name}</h2>
                    <p>{other?.profile?.role === "mentor" ? "Mentor disponible pour t'accompagner" : "Conversation étudiante"}</p>
                </div>
                <Link to={`/chat/${conversation.id}`}>Ouvrir</Link>
            </header>
            <div className="message-preview-body">
                <div className="chat-day">Aperçu</div>
                {conversation.last_message ? (
                    <div className={`preview-bubble ${conversation.last_message.sender === other?.id ? "" : "mine"}`}>
                        <p>{conversation.last_message.content}</p>
                        <span>{formatDate(conversation.last_message.created_at)}</span>
                    </div>
                ) : (
                    <div className="conversation-empty">Aucun message pour le moment. Ouvre la conversation pour commencer l'échange.</div>
                )}
            </div>
            <footer className="message-preview-footer">
                <Link to={`/chat/${conversation.id}`}>Répondre</Link>
                <Link to={`/mentors/rendez-vous?mentor_id=${other?.id || ""}`}>Prendre rendez-vous</Link>
                <Link to="/mentors">Voir les mentors</Link>
            </footer>
        </section>
    );
}

function EmptyInbox({ isMentor }) {
    return (
        <section className="messages-empty-state">
            <div className="message-illustration">💬</div>
            <h2>{isMentor ? "Aucune conversation pour le moment" : "Aucune conversation pour le moment"}</h2>
            <p>
                {isMentor
                    ? "Les échanges avec les étudiants apparaîtront ici dès qu'une conversation commencera."
                    : "Échange avec un mentor pour poser tes questions et obtenir de l'aide dans ton intégration."}
            </p>
            <div>
                {!isMentor && <Link to="/mentors">Trouver un mentor</Link>}
                <Link to="/mentors/rendez-vous">Voir mes rendez-vous</Link>
            </div>
        </section>
    );
}

function Avatar({ user, large = false }) {
    const name = getName(user);
    const src = user?.profile?.avatar_url || user?.avatar_url;
    const initial = (name[0] || "N").toUpperCase();
    return <span className={`message-avatar ${large ? "large" : ""}`}>{src ? <img src={src} alt="" /> : initial}</span>;
}
