import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const confidenceStyles = {
    élevé: { label: "Confiance élevée", bg: "#dcfce7", color: "#166534" },
    moyen: { label: "Confiance moyenne", bg: "#fef9c3", color: "#854d0e" },
    faible: { label: "Confiance faible", bg: "#fee2e2", color: "#991b1b" },
};

export default function AssistantChat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: "bot",
            content:
                "Bonjour ! Je suis NordikBot.\nJe peux répondre comme un assistant IA sur l'UQAR, les démarches d'arrivée, l'inscription, les frais, le logement, le transport et la vie au Québec. Quand j'utilise une information officielle ou locale, je t'affiche aussi mes sources.",
            sources: [],
            confidence: "",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [feedbackState, setFeedbackState] = useState({});
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function handleSend(e) {
        e.preventDefault();
        const question = input.trim();
        if (!question || loading) return;

        setMessages((prev) => [...prev, { role: "user", content: question }]);
        setInput("");
        setLoading(true);

        try {
            const res = await api.post("/assistant/chat/", {
                message: question,
                university: user?.profile?.university_info?.name || "",
                campus: user?.profile?.city || "",
                language: user?.profile?.language || "fr",
            });
            setMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    question,
                    content: res.data.answer,
                    sources: res.data.sources || [],
                    confidence: res.data.confidence || "",
                },
            ]);
        } catch (err) {
            const detail = err.response?.data?.detail || "Une erreur est survenue. Réessayez.";
            setMessages((prev) => [...prev, { role: "bot", question, content: detail, sources: [], confidence: "faible" }]);
        } finally {
            setLoading(false);
        }
    }

    async function sendFeedback(messageIndex, rating) {
        const message = messages[messageIndex];
        if (!message || message.role !== "bot") return;
        setFeedbackState((prev) => ({ ...prev, [messageIndex]: "saving" }));
        try {
            await api.post("/assistant/feedback/", {
                question: message.question || "",
                answer: message.content,
                sources: message.sources || [],
                rating,
            });
            setFeedbackState((prev) => ({ ...prev, [messageIndex]: rating }));
        } catch (err) {
            console.error(err);
            setFeedbackState((prev) => ({ ...prev, [messageIndex]: "error" }));
        }
    }

    return (
        <div className="card assistant-container" style={{ borderRadius: "var(--radius-xl)" }}>
            <div className="assistant-messages" aria-live="polite" aria-label="Conversation avec NordikBot">
                {messages.map((msg, i) => {
                    const confidence = confidenceStyles[msg.confidence] || null;
                    return (
                        <div key={i} className={`assistant-msg ${msg.role}`}>
                            <div className="sender-label">{msg.role === "bot" ? "NordikBot" : "Vous"}</div>
                            <div
                                className={`chat-bubble ${msg.role === "user" ? "mine" : ""}`}
                                style={msg.role === "bot"
                                    ? {
                                        background: "var(--color-primary-light)",
                                        color: "var(--color-secondary)",
                                        border: "1px solid #bfdbfe",
                                        alignSelf: "flex-start",
                                        whiteSpace: "pre-wrap",
                                    }
                                    : {}}
                            >
                                {msg.content}
                            </div>

                            {msg.role === "bot" && (confidence || msg.sources?.length > 0) && (
                                <div
                                    style={{
                                        alignSelf: "flex-start",
                                        maxWidth: "86%",
                                        marginTop: "0.5rem",
                                        padding: "0.7rem 0.85rem",
                                        borderRadius: "10px",
                                        background: "#f8fafc",
                                        border: "1px solid #e2e8f0",
                                        color: "#475569",
                                        fontSize: "0.78rem",
                                    }}
                                >
                                    {confidence && (
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                background: confidence.bg,
                                                color: confidence.color,
                                                borderRadius: "999px",
                                                padding: "0.18rem 0.55rem",
                                                fontWeight: 800,
                                                marginBottom: msg.sources?.length ? "0.55rem" : 0,
                                            }}
                                        >
                                            {confidence.label}
                                        </span>
                                    )}

                                    {msg.sources?.length > 0 && (
                                        <>
                                            <div style={{ fontWeight: 800, color: "#1e293b", marginBottom: "0.35rem" }}>
                                                Sources utilisées
                                            </div>
                                            {msg.sources.map((source, index) => (
                                                <div key={`${source.path}-${index}`} style={{ marginTop: index ? "0.5rem" : 0 }}>
                                                    <div style={{ fontWeight: 800 }}>
                                                        [{index + 1}] {source.title}
                                                    </div>
                                                    <div style={{ color: "#64748b" }}>
                                                        {source.section} · {source.path}
                                                    </div>
                                                    {source.excerpt && (
                                                        <div style={{ marginTop: "0.15rem", lineHeight: 1.4 }}>
                                                            {source.excerpt}
                                                        </div>
                                                    )}
                                                    {source.source_url && (
                                                        <a href={source.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 700 }}>
                                                            Source officielle
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}

                            {msg.role === "bot" && i > 0 && (
                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.55rem", alignSelf: "flex-start" }}>
                                    <button className="btn btn-sm btn-outline" type="button" onClick={() => sendFeedback(i, "useful")} disabled={feedbackState[i] === "saving"}>
                                        Réponse utile
                                    </button>
                                    <button className="btn btn-sm btn-outline" type="button" onClick={() => sendFeedback(i, "incomplete")} disabled={feedbackState[i] === "saving"}>
                                        Réponse incomplète
                                    </button>
                                    <Link className="btn btn-sm btn-primary" to="/mentors" style={{ textDecoration: "none" }}>
                                        Parler à un mentor
                                    </Link>
                                    {feedbackState[i] && feedbackState[i] !== "saving" && (
                                        <span style={{ color: feedbackState[i] === "error" ? "#991b1b" : "#166534", fontSize: "0.78rem", alignSelf: "center" }}>
                                            {feedbackState[i] === "error" ? "Feedback non envoyé" : "Merci pour votre retour"}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {loading && (
                    <div className="assistant-msg bot">
                        <div className="sender-label">NordikBot</div>
                        <div className="chat-bubble" style={{ background: "var(--color-primary-light)", color: "var(--color-secondary)", border: "1px solid #bfdbfe", alignSelf: "flex-start" }}>
                            <span className="spinner" style={{ width: 18, height: 18, margin: 0 }} />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <form className="chat-input-row" onSubmit={handleSend}>
                <label htmlFor="assistant-input" className="sr-only">Votre question</label>
                <input
                    id="assistant-input"
                    className="form-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Posez votre question sur l'UQAR, les démarches ou la vie au Québec..."
                    disabled={loading}
                    autoComplete="off"
                />
                <button className="btn btn-primary" type="submit" disabled={!input.trim() || loading}>
                    Envoyer
                </button>
            </form>
        </div>
    );
}
