import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const welcomeMessage = {
    role: "bot",
    content:
        "Bonjour, je suis NordikBot. Je peux t'aider à comprendre tes démarches, ton université, ton logement, ton budget, les mentors et la vie au Québec. Pose-moi ta question simplement.",
};

const HISTORY_PARASITE_PATTERNS = [
    /\bwait\b/i,
    /do not cut off/i,
    /let'?s write/i,
    /final clean version/i,
    /final answer/i,
    /\bdraft\b/i,
    /r[ée]ponse finale/i,
    /voici le prompt/i,
];

function isCleanHistoryMessage(msg) {
    const content = String(msg?.content || "").trim();
    if (!content) return false;
    if (content === welcomeMessage.content) return false;
    return !HISTORY_PARASITE_PATTERNS.some((pattern) => pattern.test(content));
}

function cleanDisplayText(text) {
    return String(text || "")
        .replace(/wait,?\s*do not cut off\.?/gi, "")
        .replace(/let'?s write the final clean version\.?/gi, "")
        .replace(/^draft\s*[:\-]?\s*/gi, "")
        .replace(/^final answer\s*[:\-]?\s*/gi, "")
        .replace(/^réponse finale\s*[:\-]?\s*/gi, "")
        .replace(/\n?\s*sources?\s+(utiles?|officielles?)\s*:\s*[\s\S]*$/i, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/^\s{0,3}#{1,6}\s+/gm, "")
        .replace(/^\s{0,3}\*\s+/gm, "- ")
        .replace(/(?<!\*)\*(?!\s)(.*?)(?<!\s)\*(?!\*)/g, "$1")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function clearAssistantStorage() {
    [localStorage, sessionStorage].forEach((storage) => {
        Object.keys(storage)
            .filter((key) => /nordik|assistant/i.test(key))
            .forEach((key) => storage.removeItem(key));
    });
}

export default function AssistantChat({ starterQuestion = "", suggestions = [] }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([welcomeMessage]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        clearAssistantStorage();
        setMessages([welcomeMessage]);
        setInput("");
        setCopiedIndex(null);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (starterQuestion) {
            setInput(starterQuestion);
            textareaRef.current?.focus();
        }
    }, [starterQuestion]);

    useEffect(() => {
        function resetConversation() {
            clearAssistantStorage();
            setMessages([welcomeMessage]);
            setInput("");
            setCopiedIndex(null);
        }

        window.addEventListener("nordikbot:new-conversation", resetConversation);
        return () => window.removeEventListener("nordikbot:new-conversation", resetConversation);
    }, []);

    async function handleSend(e) {
        e.preventDefault();
        const question = input.trim();
        if (!question || loading) return;

        const history = messages
            .filter((msg) => msg.role === "user" || msg.role === "bot")
            .filter(isCleanHistoryMessage)
            .slice(-6)
            .map((msg) => ({
                role: msg.role === "bot" ? "assistant" : "user",
                content: cleanDisplayText(msg.content),
            }));

        setMessages((prev) => [...prev, { role: "user", content: question }]);
        setInput("");
        setLoading(true);

        try {
            const res = await api.post("/assistant/chat/", {
                message: question,
                history,
                user_context: {
                    first_name: user?.first_name || "",
                    role: user?.profile?.role || "",
                    university: user?.profile?.university_info?.name || user?.profile?.university?.name || "",
                    campus: user?.profile?.city || "",
                    city: user?.profile?.city || "",
                    stage: user?.profile?.integration_stage || "",
                    language: user?.profile?.language || "fr",
                },
            });
            const answer = cleanDisplayText(res.data?.answer || "");
            const sources = Array.isArray(res.data?.sources) ? res.data.sources : [];
            setMessages((prev) => [...prev, { role: "bot", question, content: answer || "Désolé, je n'ai pas reçu de réponse complète. Réessaie dans quelques instants.", sources }]);
        } catch (err) {
            const detail = err.response?.data?.detail || "Désolé, je n'arrive pas à répondre pour le moment. Réessaie dans quelques instants.";
            setMessages((prev) => [...prev, { role: "bot", question, content: detail, sources: [] }]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
        }
    }

    async function copyMessage(text, index) {
        try {
            await navigator.clipboard?.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 1400);
        } catch {
            setCopiedIndex(null);
        }
    }

    const hasOnlyWelcome = messages.length === 1;

    return (
        <section className="nordik-chat">
            <div className="nordik-messages" aria-live="polite" aria-label="Conversation avec NordikBot">
                {hasOnlyWelcome && (
                    <div className="nordik-empty-state">
                        <div className="nordik-empty-icon">NB</div>
                        <h2>Bonjour, je suis NordikBot</h2>
                        <p>Je peux t'aider à comprendre tes démarches, ton université, ton logement, ton budget, les mentors et la vie au Québec. Pose-moi ta question simplement.</p>
                        <div>
                            {suggestions.slice(0, 4).map((question) => (
                                <button key={question} type="button" onClick={() => setInput(question)}>{question}</button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <article key={`${msg.role}-${i}`} className={`nordik-message ${msg.role}`}>
                        <div className="nordik-message-avatar">{msg.role === "bot" ? "NB" : "Vous"}</div>
                        <div className="nordik-message-content">
                            <div className={`nordik-bubble ${msg.role === "user" ? "mine" : ""}`}>
                                {msg.content}
                                {msg.role === "bot" && i > 0 && (
                                    <button className="copy-message-button" type="button" onClick={() => copyMessage(msg.content, i)}>
                                        {copiedIndex === i ? "Copié" : "Copier"}
                                    </button>
                                )}
                            </div>
                            {msg.role === "bot" && msg.sources?.length > 0 && (
                                <div className="nordik-sources" aria-label="Sources utiles">
                                    <p>Sources utiles</p>
                                    <div>
                                        {msg.sources.map((source) => (
                                            <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
                                                {source.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>
                ))}

                {loading && (
                    <article className="nordik-message bot">
                        <div className="nordik-message-avatar">NB</div>
                        <div className="nordik-message-content">
                            <div className="nordik-bubble typing">
                                <span />
                                <span />
                                <span />
                                <em>NordikBot écrit...</em>
                            </div>
                        </div>
                    </article>
                )}
                <div ref={bottomRef} />
            </div>

            <form className="nordik-input-row" onSubmit={handleSend}>
                <label htmlFor="assistant-input" className="sr-only">Votre question</label>
                <textarea
                    ref={textareaRef}
                    id="assistant-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pose ta question à NordikBot..."
                    disabled={loading}
                    autoComplete="off"
                    rows={1}
                />
                <button type="submit" disabled={!input.trim() || loading}>Envoyer</button>
            </form>
        </section>
    );
}
