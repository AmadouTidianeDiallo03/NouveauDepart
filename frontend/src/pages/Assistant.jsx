import { useState } from "react";
import { Link } from "react-router-dom";
import AssistantChat from "../components/AssistantChat";
import "../styles/assistant.css";

const suggestions = [
    "Comment se passe l'admission à l'UQAR ?",
    "Quelles sont les premières démarches à mon arrivée ?",
    "Comment trouver un logement ?",
    "Comment contacter un mentor ?",
];

export default function Assistant() {
    const [starterQuestion, setStarterQuestion] = useState("");

    function newConversation() {
        setStarterQuestion("");
        window.dispatchEvent(new CustomEvent("nordikbot:new-conversation"));
    }

    return (
        <main className="assistant-page">
            <section className="assistant-shell">
                <header className="assistant-header">
                    <div className="assistant-title-row">
                        <div className="assistant-bot-icon">NB</div>
                        <div>
                            <span>Assistant IA</span>
                            <h1>NordikBot</h1>
                            <p>Pose tes questions sur l'intégration, l'université, le logement, les démarches et la vie au Québec.</p>
                        </div>
                    </div>
                    <div className="assistant-header-actions">
                        <button type="button" onClick={newConversation}>Nouvelle conversation</button>
                        <Link to="/mentors">Parler à un mentor</Link>
                    </div>
                </header>

                <section className="assistant-suggestions" aria-label="Suggestions de questions">
                    {suggestions.map((question) => (
                        <button key={question} type="button" onClick={() => setStarterQuestion(question)}>
                            {question}
                        </button>
                    ))}
                </section>

                <AssistantChat starterQuestion={starterQuestion} suggestions={suggestions} />
            </section>
        </main>
    );
}
