import { useEffect, useRef } from "react";

export default function ChatThread({ messages, currentUserId }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function formatTime(dt) {
        return new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    return (
        <div className="chat-thread" aria-live="polite" aria-label="Messages">
            {messages.length === 0 && (
                <p className="text-muted text-center" style={{ marginTop: "2rem" }}>
                    Aucun message. Envoyez le premier ! 👋
                </p>
            )}
            {messages.map((msg) => {
                const mine = msg.sender.id === currentUserId;
                return (
                    <div key={msg.id} className={`chat-bubble ${mine ? "mine" : "theirs"}`}>
                        {msg.content}
                        <div className="chat-bubble__time">{formatTime(msg.created_at)}</div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}
