import { useEffect, useMemo, useRef, useState } from "react";
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

function cleanSpeechText(text) {
    return cleanDisplayText(text)
        .replace(/https?:\/\/\S+/g, "")
        .replace(/\[[^\]]+\]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function clearAssistantStorage() {
    [localStorage, sessionStorage].forEach((storage) => {
        Object.keys(storage)
            .filter((key) => /nordik|assistant/i.test(key))
            .forEach((key) => storage.removeItem(key));
    });
}

function getSpeechRecognition() {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function getFrenchVoice() {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    return (
        voices.find((voice) => voice.lang?.toLowerCase().startsWith("fr-ca")) ||
        voices.find((voice) => voice.lang?.toLowerCase().startsWith("fr")) ||
        null
    );
}

export default function AssistantChat({ starterQuestion = "", suggestions = [] }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([welcomeMessage]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [listening, setListening] = useState(false);
    const [voiceError, setVoiceError] = useState("");
    const [speakingIndex, setSpeakingIndex] = useState(null);
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);
    const recognitionRef = useRef(null);
    const finalTranscriptRef = useRef("");
    const voiceReplyPendingRef = useRef(false);

    const speechRecognitionSupported = useMemo(() => Boolean(getSpeechRecognition()), []);
    const speechSynthesisSupported = typeof window !== "undefined" && "speechSynthesis" in window;

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
            window.speechSynthesis?.cancel();
            recognitionRef.current?.abort?.();
            clearAssistantStorage();
            setMessages([welcomeMessage]);
            setInput("");
            setCopiedIndex(null);
            setListening(false);
            setSpeakingIndex(null);
            setVoiceError("");
        }

        window.addEventListener("nordikbot:new-conversation", resetConversation);
        return () => window.removeEventListener("nordikbot:new-conversation", resetConversation);
    }, []);

    useEffect(() => {
        return () => {
            window.speechSynthesis?.cancel();
            recognitionRef.current?.abort?.();
        };
    }, []);

    function buildHistory() {
        return messages
            .filter((msg) => msg.role === "user" || msg.role === "bot")
            .filter(isCleanHistoryMessage)
            .slice(-6)
            .map((msg) => ({
                role: msg.role === "bot" ? "assistant" : "user",
                content: cleanDisplayText(msg.content),
            }));
    }

    async function sendQuestion(rawQuestion, options = {}) {
        const question = String(rawQuestion || "").trim();
        if (!question || loading) return;

        const history = buildHistory();

        setMessages((prev) => [...prev, { role: "user", content: question }]);
        setInput("");
        setLoading(true);
        setVoiceError("");
        voiceReplyPendingRef.current = Boolean(options.speakResponse);

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
            const contacts = Array.isArray(res.data?.contacts) ? res.data.contacts : [];
            const botMessage = {
                role: "bot",
                question,
                content: answer || "Désolé, je n'ai pas reçu de réponse complète. Réessaie dans quelques instants.",
                sources,
                contacts,
                domain: res.data?.domain || "general",
                intent: res.data?.intent || "general",
            };

            setMessages((prev) => {
                const next = [...prev, botMessage];
                if (voiceReplyPendingRef.current) {
                    setTimeout(() => speakText(botMessage.content, next.length - 1), 80);
                }
                return next;
            });
        } catch (err) {
            const detail = err.response?.data?.detail || "Désolé, je n'arrive pas à répondre pour le moment. Réessaie dans quelques instants.";
            setMessages((prev) => [...prev, { role: "bot", question, content: detail, sources: [], contacts: [] }]);
            if (voiceReplyPendingRef.current) {
                setTimeout(() => speakText(detail, "error"), 80);
            }
        } finally {
            setLoading(false);
            voiceReplyPendingRef.current = false;
        }
    }

    async function handleSend(e) {
        e.preventDefault();
        await sendQuestion(input);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
        }
    }

    function startVoiceQuestion() {
        if (!speechRecognitionSupported || loading) {
            setVoiceError("La reconnaissance vocale n'est pas disponible dans ce navigateur.");
            return;
        }

        if (listening) {
            recognitionRef.current?.stop?.();
            return;
        }

        const Recognition = getSpeechRecognition();
        const recognition = new Recognition();
        recognition.lang = "fr-CA";
        recognition.continuous = false;
        recognition.interimResults = true;
        finalTranscriptRef.current = "";
        setVoiceError("");
        setInput("");

        recognition.onstart = () => setListening(true);
        recognition.onerror = (event) => {
            const message = event.error === "not-allowed"
                ? "Autorise le micro dans ton navigateur pour parler à NordikBot."
                : "Je n'ai pas pu écouter correctement. Réessaie.";
            setVoiceError(message);
            setListening(false);
        };
        recognition.onresult = (event) => {
            let interim = "";
            let finalText = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const transcript = event.results[i][0]?.transcript || "";
                if (event.results[i].isFinal) {
                    finalText += transcript;
                } else {
                    interim += transcript;
                }
            }

            if (finalText.trim()) {
                finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalText}`.trim();
            }

            setInput((finalTranscriptRef.current || interim).trim());
        };
        recognition.onend = () => {
            setListening(false);
            const finalQuestion = finalTranscriptRef.current.trim();
            if (finalQuestion) {
                sendQuestion(finalQuestion, { speakResponse: true });
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }

    function speakText(text, index) {
        if (!speechSynthesisSupported) {
            setVoiceError("La lecture audio n'est pas disponible dans ce navigateur.");
            return;
        }

        const speechText = cleanSpeechText(text);
        if (!speechText) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = "fr-CA";
        utterance.rate = 0.95;
        utterance.pitch = 1;
        const voice = getFrenchVoice();
        if (voice) utterance.voice = voice;

        utterance.onstart = () => setSpeakingIndex(index);
        utterance.onend = () => setSpeakingIndex(null);
        utterance.onerror = () => setSpeakingIndex(null);
        window.speechSynthesis.speak(utterance);
    }

    function stopSpeaking() {
        window.speechSynthesis?.cancel();
        setSpeakingIndex(null);
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
            <div className="nordik-voice-toolbar" aria-label="Mode vocal NordikBot">
                <button
                    className={`nordik-voice-button ${listening ? "listening" : ""}`}
                    type="button"
                    onClick={startVoiceQuestion}
                    disabled={loading || !speechRecognitionSupported}
                    title={speechRecognitionSupported ? "Parler à NordikBot" : "Reconnaissance vocale non disponible"}
                    aria-label={listening ? "Arrêter l'écoute" : "Parler à NordikBot"}
                >
                    <VoiceIcon name="microphone" />
                </button>
                <div className="nordik-voice-status">
                    <strong>{listening ? "J'écoute..." : "Mode vocal"}</strong>
                    <span>{listening ? "Parle naturellement, la question sera envoyée automatiquement." : "Pose une question au micro et écoute la réponse."}</span>
                    {voiceError && <em>{voiceError}</em>}
                </div>
                {speakingIndex !== null && (
                    <button className="nordik-stop-audio" type="button" onClick={stopSpeaking}>
                        Arrêter l'audio
                    </button>
                )}
            </div>

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
                                    <div className="nordik-message-tools">
                                        <button className="copy-message-button" type="button" onClick={() => copyMessage(msg.content, i)}>
                                            {copiedIndex === i ? "Copié" : "Copier"}
                                        </button>
                                        {speechSynthesisSupported && (
                                            <button className="speak-message-button" type="button" onClick={() => (speakingIndex === i ? stopSpeaking() : speakText(msg.content, i))}>
                                                <VoiceIcon name={speakingIndex === i ? "stop" : "speaker"} />
                                                {speakingIndex === i ? "Stop" : "Écouter"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            {msg.role === "bot" && msg.sources?.length > 0 && (
                                <div className="nordik-sources" aria-label="Sources officielles">
                                    <p>Sources officielles</p>
                                    <div>
                                        {msg.sources.map((source) => (
                                            <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
                                                {source.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {msg.role === "bot" && msg.contacts?.length > 0 && (
                                <div className="nordik-contacts" aria-label="Contacts utiles">
                                    <p>Contacts utiles</p>
                                    <div className="nordik-contact-list">
                                        {msg.contacts.map((contact) => (
                                            <article key={`${contact.label}-${contact.email || contact.phone}`} className="nordik-contact-card">
                                                <strong>{contact.label}</strong>
                                                {contact.campus && <span>Campus : {contact.campus}</span>}
                                                {contact.location && <span>Lieu : {contact.location}</span>}
                                                {contact.phone && <span>Téléphone : {contact.phone}</span>}
                                                {contact.email && (
                                                    <div className="nordik-contact-actions">
                                                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                                                        <button type="button" onClick={() => copyMessage(contact.email, `email-${i}`)}>
                                                            {copiedIndex === `email-${i}` ? "Copié" : "Copier"}
                                                        </button>
                                                    </div>
                                                )}
                                            </article>
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
                <button
                    className={`nordik-input-mic ${listening ? "listening" : ""}`}
                    type="button"
                    onClick={startVoiceQuestion}
                    disabled={loading || !speechRecognitionSupported}
                    aria-label={listening ? "Arrêter l'écoute" : "Dicter une question"}
                    title={speechRecognitionSupported ? "Dicter une question" : "Reconnaissance vocale non disponible"}
                >
                    <VoiceIcon name="microphone" />
                </button>
                <textarea
                    ref={textareaRef}
                    id="assistant-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={listening ? "Je t'écoute..." : "Pose ta question à NordikBot..."}
                    disabled={loading}
                    autoComplete="off"
                    rows={1}
                />
                <button type="submit" disabled={!input.trim() || loading}>Envoyer</button>
            </form>
        </section>
    );
}

function VoiceIcon({ name }) {
    const paths = {
        microphone: "M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm6-3a6 6 0 0 1-12 0M12 17v4m-4 0h8",
        speaker: "M4 10v4h4l5 4V6l-5 4H4Zm12-1a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12",
        stop: "M7 7h10v10H7z",
    };

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={paths[name]} />
        </svg>
    );
}
