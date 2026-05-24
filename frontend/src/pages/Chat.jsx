import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import MenteeProfile from "../components/MenteeProfile";
import SharedResources from "../components/SharedResources";
import MentorAvailabilityModal from "../components/MentorAvailabilityModal";

const GRADIENTS = [
    "linear-gradient(135deg, #6366f1, #8b5cf6)",
    "linear-gradient(135deg, #0ea5e9, #6366f1)",
    "linear-gradient(135deg, #10b981, #0ea5e9)",
    "linear-gradient(135deg, #f59e0b, #ef4444)",
    "linear-gradient(135deg, #ec4899, #8b5cf6)",
];

function formatTime(dt) {
    return new Date(dt).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
}
function formatDay(dt) {
    const d = new Date(dt);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    return d.toLocaleDateString("fr-CA", { day: "2-digit", month: "long" });
}

export default function Chat() {
    const { id } = useParams();
    const { user: me } = useAuth();
    const [conv, setConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [resources, setResources] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [showMenteeProfile, setShowMenteeProfile] = useState(false);
    const [showMentorAvailability, setShowMentorAvailability] = useState(false);
    const [mentorData, setMentorData] = useState(null);
    const [showAddResource, setShowAddResource] = useState(false);
    const [resourceForm, setResourceForm] = useState({ title: "", url: "", description: "", resource_type: "link" });
    const [loadingResources, setLoadingResources] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        Promise.all([
            api.get(`/chat/conversations/${id}/messages/`),
            api.get("/chat/conversations/").catch(() => ({ data: [] })),
            api.get(`/chat/conversations/${id}/resources/`).catch(() => ({ data: [] })),
        ]).then(([msgs, convList, res]) => {
            setMessages(msgs.data.results || msgs.data);
            setResources(res.data.results || res.data || []);
            const list = convList.data.results || convList.data;
            const found = list.find((c) => String(c.id) === String(id));
            setConv(found || null);
        }).finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function handleSend(e) {
        e.preventDefault();
        const content = input.trim();
        if (!content) return;
        try {
            const res = await api.post(`/chat/conversations/${id}/messages/`, { content });
            setMessages((prev) => [...prev, res.data]);
            setInput("");
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchMentorDetail() {
        if (!conv?.other_user?.id) return;
        try {
            const res = await api.get(`/auth/mentors/${conv.other_user.id}/`);
            setMentorData(res.data);
        } catch (err) {
            console.error("Error fetching mentor details:", err);
        }
    }

    async function handleMentorRequest(message) {
        try {
            await api.post("/auth/mentor-requests/", {
                mentor_id: conv.other_user.id,
                message,
            });
            return true;
        } catch (err) {
            console.error("Error sending mentor request:", err);
            throw err;
        }
    }

    async function handleAddResource(e) {
        e.preventDefault();
        if (!resourceForm.title || !resourceForm.url) return;
        setLoadingResources(true);
        try {
            const res = await api.post(`/chat/conversations/${id}/resources/`, resourceForm);
            setResources((prev) => [...prev, res.data]);
            setResourceForm({ title: "", url: "", description: "", resource_type: "link" });
            setShowAddResource(false);
        } catch (err) {
            console.error("Error adding resource:", err);
        } finally {
            setLoadingResources(false);
        }
    }

    const handleViewMenteeProfile = async () => {
        if (conv?.other_user?.id && !mentorData) {
            await fetchMentorDetail();
        }
        setShowMentorAvailability(true);
    };

    const handleShowMenteeProfile = () => {
        setShowMenteeProfile(true);
    };

    if (loading) return <div className="page-content"><div className="spinner" /></div>;

    const isMentor = me?.profile?.role === "mentor";
    const otherUser = conv?.other_user;
    const otherInitial = (otherUser?.first_name?.[0] || "U").toUpperCase();
    const otherAvatar = otherUser?.profile?.avatar_url;
    const gradient = GRADIENTS[Number(id) % GRADIENTS.length];
    const heroBg = isMentor
        ? "linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)"
        : "linear-gradient(135deg, #0c4a6e, #0369a1, #0ea5e9)";

    return (
        <div className="page-content" style={{ background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            
            <div style={{
                background: heroBg,
                padding: "1rem 0",
                position: "sticky", top: 0, zIndex: 10,
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}>
                <div className="container container-sm">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                            <BackButton to="/conversations" label="" />

                            
                            <div style={{
                                width: 42, height: 42, borderRadius: "50%",
                                background: otherAvatar ? "transparent" : gradient,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 800, color: "#fff", fontSize: "1rem", flexShrink: 0,
                                overflow: "hidden",
                                border: "2px solid rgba(255,255,255,0.3)",
                            }}>
                                {otherAvatar
                                    ? <img src={otherAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : otherInitial
                                }
                            </div>

                            <div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2 }}>
                                    {otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : "Conversation"}
                                </div>
                                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>
                                    {isMentor ? "Mentoré" : "Mentor"}
                                </div>
                            </div>
                        </div>

                        
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                                onClick={isMentor ? handleShowMenteeProfile : handleViewMenteeProfile}
                                style={{
                                    background: "rgba(255,255,255,0.2)",
                                    border: "1px solid rgba(255,255,255,0.3)",
                                    color: "#fff",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "8px",
                                    fontSize: "0.8rem",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                            >
                                {isMentor ? "👤 Profil" : "📋 Demander"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            
            <div style={{ flex: 1, overflowY: "auto" }}>
                <div className="container container-sm" style={{ padding: "1.5rem 1.25rem" }}>
                    
                    {!isMentor && (
                        <SharedResources
                            resources={resources}
                            onAddResource={() => setShowAddResource(true)}
                            isLoading={loadingResources}
                        />
                    )}

                    
                    {messages.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#94a3b8", padding: "3rem 0" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>👋</div>
                            <div style={{ fontWeight: 600, color: "#475569" }}>Commence la conversation !</div>
                            <div style={{ fontSize: "0.85rem", marginTop: "0.3rem" }}>Ton premier message sera affiché ici</div>
                        </div>
                    ) : (
                        (() => {
                            let lastDay = null;
                            return messages.map((msg) => {
                                const isMe = msg.sender?.id === me?.id || msg.sender === me?.id;
                                const day = formatDay(msg.created_at || msg.timestamp || new Date());
                                const showDay = day !== lastDay;
                                lastDay = day;
                                return (
                                    <div key={msg.id}>
                                        {showDay && (
                                            <div style={{ textAlign: "center", margin: "1.25rem 0 0.5rem" }}>
                                                <span style={{
                                                    background: "#e2e8f0", borderRadius: "999px",
                                                    padding: "0.2rem 0.85rem", fontSize: "0.75rem", color: "#64748b", fontWeight: 600,
                                                }}>{day}</span>
                                            </div>
                                        )}
                                        <div style={{
                                            display: "flex",
                                            justifyContent: isMe ? "flex-end" : "flex-start",
                                            marginBottom: "0.5rem",
                                        }}>
                                            <div style={{
                                                maxWidth: "72%",
                                                padding: "0.65rem 0.95rem",
                                                borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                                background: isMe
                                                    ? (isMentor ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "linear-gradient(135deg, #1d4ed8, #2563eb)")
                                                    : "#fff",
                                                color: isMe ? "#fff" : "#0f172a",
                                                boxShadow: isMe ? "0 2px 8px rgba(99,102,241,0.25)" : "0 2px 8px rgba(0,0,0,0.08)",
                                                fontSize: "0.92rem",
                                                lineHeight: 1.5,
                                                border: isMe ? "none" : "1px solid #f1f5f9",
                                            }}>
                                                <div>{msg.content}</div>
                                                <div style={{
                                                    fontSize: "0.7rem",
                                                    color: isMe ? "rgba(255,255,255,0.65)" : "#94a3b8",
                                                    textAlign: isMe ? "right" : "left",
                                                    marginTop: "0.3rem",
                                                }}>
                                                    {formatTime(msg.created_at || msg.timestamp || new Date())}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })()
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            
            <div style={{
                background: "#fff",
                borderTop: "1px solid #e2e8f0",
                padding: "0.75rem 0",
                position: "sticky", bottom: 0,
                boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
            }}>
                <div className="container container-sm">
                    <form onSubmit={handleSend} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Écrire un message…"
                            autoFocus
                            style={{
                                flex: 1,
                                padding: "0.75rem 1.1rem",
                                borderRadius: "999px",
                                border: "1.5px solid #e2e8f0",
                                fontSize: "0.92rem",
                                outline: "none",
                                transition: "border-color 0.2s",
                                background: "#f8fafc",
                            }}
                            onFocus={e => e.target.style.borderColor = isMentor ? "#6366f1" : "#2563eb"}
                            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            style={{
                                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                                background: input.trim()
                                    ? (isMentor ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "linear-gradient(135deg, #1d4ed8, #2563eb)")
                                    : "#e2e8f0",
                                border: "none", cursor: input.trim() ? "pointer" : "default",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.1rem", transition: "all 0.2s",
                                boxShadow: input.trim() ? "0 4px 12px rgba(99,102,241,0.4)" : "none",
                            }}
                        >
                            
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            
            <MenteeProfile
                user={otherUser}
                isOpen={showMenteeProfile}
                onClose={() => setShowMenteeProfile(false)}
            />

            <MentorAvailabilityModal
                mentor={mentorData}
                isOpen={showMentorAvailability}
                onClose={() => setShowMentorAvailability(false)}
                onRequest={handleMentorRequest}
            />

            
            {showAddResource && (
                <>
                    <div
                        onClick={() => setShowAddResource(false)}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.5)",
                            zIndex: 999,
                        }}
                    />
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "#fff",
                            borderRadius: "20px",
                            width: "90%",
                            maxWidth: "500px",
                            padding: "2rem",
                            zIndex: 1000,
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        <h2 style={{ margin: 0, marginBottom: "1.5rem", color: "#0f172a" }}>
                            📚 Partager une ressource
                        </h2>

                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "#0f172a", fontWeight: 600, fontSize: "0.9rem" }}>
                                Titre *
                            </label>
                            <input
                                type="text"
                                value={resourceForm.title}
                                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                                placeholder="Ex: Guide d'intégration"
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    fontSize: "0.95rem",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "#0f172a", fontWeight: 600, fontSize: "0.9rem" }}>
                                URL *
                            </label>
                            <input
                                type="url"
                                value={resourceForm.url}
                                onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                                placeholder="https://..."
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    fontSize: "0.95rem",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "#0f172a", fontWeight: 600, fontSize: "0.9rem" }}>
                                Description
                            </label>
                            <textarea
                                value={resourceForm.description}
                                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                                placeholder="Décrivez cette ressource..."
                                style={{
                                    width: "100%",
                                    minHeight: "80px",
                                    padding: "0.75rem",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    fontSize: "0.95rem",
                                    boxSizing: "border-box",
                                    fontFamily: "inherit",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "#0f172a", fontWeight: 600, fontSize: "0.9rem" }}>
                                Type
                            </label>
                            <select
                                value={resourceForm.resource_type}
                                onChange={(e) => setResourceForm({ ...resourceForm, resource_type: e.target.value })}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    fontSize: "0.95rem",
                                }}
                            >
                                <option value="link">Lien</option>
                                <option value="document">Document</option>
                                <option value="video">Vidéo</option>
                                <option value="article">Article</option>
                                <option value="guide">Guide</option>
                            </select>
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                onClick={() => setShowAddResource(false)}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    background: "#f1f5f9",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    color: "#0f172a",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddResource}
                                disabled={loadingResources || !resourceForm.title || !resourceForm.url}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    background: loadingResources || !resourceForm.title || !resourceForm.url ? "#cbd5e1" : "#6366f1",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                    cursor: loadingResources || !resourceForm.title || !resourceForm.url ? "not-allowed" : "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    if (!loadingResources && resourceForm.title && resourceForm.url) {
                                        e.currentTarget.style.background = "#4f46e5";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loadingResources && resourceForm.title && resourceForm.url) {
                                        e.currentTarget.style.background = "#6366f1";
                                    }
                                }}
                            >
                                {loadingResources ? "Ajout..." : "Ajouter"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
