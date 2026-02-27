import { useState, useRef, useEffect } from "react";
import api from "../services/api";

export default function AssistantChat() {
    const [messages, setMessages] = useState([
        {
            role: "bot",
            content:
                "Bonjour ! Je suis NouveauBot 🍁\nJe réponds à vos questions sur l'intégration au Québec (administration, université, transport, réussite académique).\nComment puis-je vous aider ?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
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
            const res = await api.post("/assistant/ask", { question });
            setMessages((prev) => [...prev, { role: "bot", content: res.data.answer }]);
        } catch (err) {
            const detail = err.response?.data?.detail || "Une erreur est survenue. Réessayez.";
            setMessages((prev) => [...prev, { role: "bot", content: detail }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card assistant-container" style={{ borderRadius: "var(--radius-xl)" }}>
            <div className="assistant-messages" aria-live="polite" aria-label="Conversation avec NouveauBot">
                {messages.map((msg, i) => (
                    <div key={i} className={`assistant-msg ${msg.role}`}>
                        <div className="sender-label">{msg.role === "bot" ? "🤖 NouveauBot" : "Vous"}</div>
                        <div className={`chat-bubble ${msg.role === "user" ? "mine" : ""}`}
                            style={msg.role === "bot" ? { background: "var(--color-primary-light)", color: "var(--color-secondary)", border: "1px solid #bfdbfe", alignSelf: "flex-start", whiteSpace: "pre-wrap" } : {}}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="assistant-msg bot">
                        <div className="sender-label">🤖 NouveauBot</div>
                        <div className="chat-bubble" style={{ background: "var(--color-primary-light)", color: "var(--color-secondary)", border: "1px solid #bfdbfe", alignSelf: "flex-start" }}>
                            <span className="spinner" style={{ width: 18, height: 18, margin: "0" }} />
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
                    placeholder="Posez votre question en français ou en anglais…"
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
