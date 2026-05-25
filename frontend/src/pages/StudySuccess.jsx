import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import useScrollToHash from "../hooks/useScrollToHash";
import "../styles/study-success.css";

const studySections = [
    {
        id: "credits",
        icon: "CR",
        title: "Système de crédits",
        summary: "Les crédits permettent de mesurer la charge d'un cours et la progression dans ton programme.",
        points: [
            "Un cours universitaire vaut souvent 3 crédits.",
            "Une session à temps plein représente souvent environ 12 à 15 crédits.",
            "Un baccalauréat comprend généralement 90 crédits.",
        ],
        advice: "Vérifie toujours ton cheminement officiel avant de choisir tes cours.",
    },
    {
        id: "evaluations",
        icon: "NT",
        title: "Évaluations & notes",
        summary: "Chaque cours a son propre plan de cours avec les travaux, examens et critères d'évaluation.",
        points: [
            "Lis le plan de cours dès la première semaine.",
            "Note les dates des travaux, examens intra et examens finaux.",
            "Les notes peuvent être en pourcentage, en lettres ou selon une grille propre au cours.",
        ],
        advice: "Si une consigne n'est pas claire, demande rapidement au professeur ou à la personne chargée du cours.",
    },
    {
        id: "organisation",
        icon: "AG",
        title: "Organisation & calendrier",
        summary: "Le calendrier universitaire t'aide à repérer les dates importantes de chaque session.",
        points: [
            "Automne : souvent de septembre à décembre.",
            "Hiver : souvent de janvier à avril.",
            "Été : parfois optionnel selon le programme.",
        ],
        advice: "Ajoute les dates limites dans ton agenda dès le début de la session.",
    },
    {
        id: "methodes",
        icon: "ME",
        title: "Méthodes d'étude",
        summary: "La réussite dépend autant de la régularité que du temps passé à étudier.",
        points: [
            "Travaille un peu chaque semaine plutôt que tout faire à la dernière minute.",
            "Utilise des méthodes comme Pomodoro, Cornell ou les fiches de révision.",
            "Crée un petit groupe d'étude si cela t'aide à rester motivé.",
        ],
        advice: "Un rythme simple et constant vaut mieux qu'un gros effort juste avant l'examen.",
    },
    {
        id: "aide",
        icon: "AI",
        title: "Où demander de l'aide",
        summary: "Demander de l'aide tôt est normal et fait partie de la réussite universitaire.",
        points: [
            "Contacte ton professeur ou ton département pour les questions de cours.",
            "Utilise les services aux étudiants pour l'accompagnement et l'orientation.",
            "Parle à un mentor si tu veux un conseil basé sur l'expérience.",
        ],
        advice: "N'attends pas d'être en difficulté avancée pour poser une question.",
    },
    {
        id: "integrite",
        icon: "IN",
        title: "Intégrité académique",
        summary: "L'intégrité académique concerne le plagiat, les citations et l'utilisation correcte des sources.",
        points: [
            "Cite toujours les idées, images, données ou textes qui ne viennent pas de toi.",
            "Paraphraser sans citer peut aussi être considéré comme du plagiat.",
            "En cas de doute, demande à ton professeur avant de remettre le travail.",
        ],
        advice: "Mieux vaut poser une question que remettre un travail avec une citation incertaine.",
    },
];

const tips = [
    "Lire son plan de cours dès la première semaine",
    "Noter toutes les dates importantes",
    "Demander de l'aide rapidement",
    "Garder un rythme d'étude régulier",
    "Utiliser les services universitaires",
];

export default function StudySuccess() {
    useScrollToHash();

    return (
        <div className="study-page">
            <section className="study-hero">
                <div className="study-container">
                    <BackButton />
                    <div className="study-hero-content">
                        <span className="study-kicker">Guide académique</span>
                        <h1>Réussite Académique</h1>
                        <p>Comprends le fonctionnement universitaire au Québec et organise-toi pour réussir tes cours.</p>
                        <small>Crédits, notes, calendrier, méthodes d'étude et services d'aide : tout ce qu'il faut comprendre pour bien commencer.</small>
                    </div>
                </div>
            </section>

            <main className="study-container study-main">
                <nav className="study-tabs" aria-label="Navigation réussite académique">
                    {studySections.map((section) => (
                        <a key={section.id} href={`#${section.id}`}>{section.title}</a>
                    ))}
                </nav>

                <section className="study-section-grid">
                    {studySections.map((section) => (
                        <article className="study-card" id={section.id} key={section.id}>
                            <div className="study-card-icon">{section.icon}</div>
                            <div>
                                <h2>{section.title}</h2>
                                <p>{section.summary}</p>
                            </div>
                            <ul>
                                {section.points.map((point) => <li key={point}>{point}</li>)}
                            </ul>
                            <div className="study-note">
                                <strong>À retenir</strong>
                                <span>{section.advice}</span>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="study-panel">
                    <div className="study-panel-header">
                        <span className="study-kicker dark">Bon départ</span>
                        <h2>Conseils pour bien commencer</h2>
                        <p>Quelques habitudes simples peuvent faire une vraie différence dès les premières semaines.</p>
                    </div>
                    <div className="study-tip-grid">
                        {tips.map((tip, index) => (
                            <article className="study-tip" key={tip}>
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                <strong>{tip}</strong>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="study-actions">
                    <div>
                        <h2>Besoin d'avancer maintenant ?</h2>
                        <p>Va directement vers les outils qui peuvent t'aider à organiser ta session.</p>
                    </div>
                    <div className="study-actions-grid">
                        <Link to="/checklist">Voir ma checklist</Link>
                        <Link to="/assistant">Poser une question à NordikBot</Link>
                        <Link to="/mentors">Contacter un mentor</Link>
                        <a href="https://www.uqar.ca/programmes-formations-et-admission/calendrier-universitaire/" target="_blank" rel="noopener noreferrer">Voir le calendrier universitaire</a>
                        <Link to="/dashboard">Retour au tableau de bord</Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
