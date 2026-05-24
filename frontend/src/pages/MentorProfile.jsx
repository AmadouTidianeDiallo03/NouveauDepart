import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/mentors.css";

export default function MentorProfile() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestMessage, setRequestMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get(`/auth/mentors/${id}/`)
            .then((response) => setMentor(response.data))
            .catch(() => setError("Impossible de charger le profil du mentor."))
            .finally(() => setLoading(false));
    }, [id]);

    async function sendMessage() {
        try {
            const response = await api.post("/chat/conversations/", { mentor_id: mentor.id });
            navigate(`/chat/${response.data.id}`);
        } catch (err) {
            setError("Impossible d’ouvrir la conversation.");
        }
    }

    async function sendRequest(event) {
        event.preventDefault();
        setSending(true);
        setError("");
        try {
            await api.post("/auth/mentor-requests/", { mentor_id: id, message: requestMessage });
            setSuccess(true);
            setRequestMessage("");
        } catch (err) {
            setError(err.response?.data?.detail || "Une erreur est survenue lors de l’envoi de la demande.");
        } finally {
            setSending(false);
        }
    }

    if (loading) return <div className="mentors-page mentors-loading"><div className="mentors-spinner" />Chargement du profil...</div>;
    if (error && !mentor) return <div className="mentors-page mentors-empty"><strong>{error}</strong><Link to="/mentors">Retour aux mentors</Link></div>;

    const fullName = mentor.full_name || mentor.email;
    const initials = fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    const topics = mentor.help_topics?.length ? mentor.help_topics : splitList(mentor.specialties || "Logement,Vie universitaire,Démarches");
    const languages = mentor.languages?.length ? mentor.languages : [mentor.language === "en" ? "English" : "Français"];
    const isOwnProfile = user?.id === mentor.id;

    return (
        <div className="mentors-page">
            <section className="mentor-profile-hero">
                <Link to="/mentors" className="back-link">← Retour aux mentors</Link>
            </section>

            <main className="mentor-profile-container">
                <section className="mentor-profile-main-card">
                    <div className="profile-head">
                        <div className="profile-avatar">
                            {mentor.avatar_url ? <img src={mentor.avatar_url} alt="" /> : initials}
                        </div>
                        <div>
                            <div className="mentor-name-row">
                                <h1>{fullName}</h1>
                                {mentor.is_verified && <span className="verified-badge">Vérifié</span>}
                            </div>
                            <p>{mentor.university?.name || "Université non indiquée"} {mentor.campus ? `· ${mentor.campus}` : ""}</p>
                            <div className="mentor-badges">
                                <span>Mentor</span>
                                <span className="compat">{mentor.compatibility || "Peut aider"}</span>
                                <span>{mentor.availability_status || "Disponibilités à confirmer"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-info-grid">
                        <Info label="Pays d’origine" value={mentor.country_origin || "Non indiqué"} />
                        <Info label="Ville / campus" value={mentor.campus || mentor.city || "Non indiqué"} />
                        <Info label="Langues" value={languages.join(", ")} />
                        <Info label="Programme" value={mentor.program || "Non précisé"} />
                        <Info label="Niveau d’études" value={mentor.study_level || "Non précisé"} />
                        <Info label="Université" value={mentor.university?.name || "Non indiquée"} />
                    </div>

                    <section className="profile-section">
                        <h2>À propos</h2>
                        <p>{mentor.bio || "Ce mentor n’a pas encore rédigé de biographie complète."}</p>
                    </section>

                    <section className="profile-section">
                        <h2>Ce mentor peut t’aider pour :</h2>
                        <div className="topic-tags">
                            {topics.map((topic) => <span key={topic}>{topic}</span>)}
                        </div>
                    </section>

                    <section className="profile-section">
                        <h2>Disponibilités habituelles</h2>
                        {mentor.availabilities?.length ? (
                            <div className="availability-grid">
                                {mentor.availabilities.map((availability) => (
                                    <div key={availability.id}>
                                        <strong>{dayLabel(availability.day_of_week)}</strong>
                                        <span>{String(availability.start_time).slice(0, 5)} - {String(availability.end_time).slice(0, 5)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Disponibilités à confirmer.</p>
                        )}
                    </section>
                </section>

                <aside className="mentor-contact-card">
                    <h2>Contacter ce mentor</h2>
                    <p>Tu peux lui envoyer un message, prendre rendez-vous ou faire une demande d’accompagnement.</p>
                    <button type="button" onClick={sendMessage} disabled={isOwnProfile}>Envoyer un message</button>
                    <Link to={`/mentors/rendez-vous?mentor_id=${mentor.id}`}>Prendre rendez-vous</Link>

                    {success ? (
                        <div className="request-success">Demande envoyée. Attends la réponse du mentor.</div>
                    ) : (
                        <form onSubmit={sendRequest}>
                            <label>Demande d’accompagnement</label>
                            <textarea
                                value={requestMessage}
                                onChange={(event) => setRequestMessage(event.target.value)}
                                placeholder="Décris brièvement ton besoin..."
                                required
                            />
                            {error && <p className="mentor-form-error">{error}</p>}
                            <button type="submit" disabled={sending || isOwnProfile}>{sending ? "Envoi..." : "Envoyer la demande"}</button>
                        </form>
                    )}
                    {isOwnProfile && <p className="mentor-note">C’est ton propre profil.</p>}
                </aside>
            </main>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

function splitList(value) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function dayLabel(day) {
    const labels = {
        monday: "Lundi",
        tuesday: "Mardi",
        wednesday: "Mercredi",
        thursday: "Jeudi",
        friday: "Vendredi",
        saturday: "Samedi",
        sunday: "Dimanche",
    };
    return labels[day] || day;
}
