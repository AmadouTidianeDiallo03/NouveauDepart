import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import "../styles/university.css";

const UQAR_LINKS = {
    website: "https://www.uqar.ca",
    portal: "https://mondossier.uqar.ca",
    admission: "https://www.uqar.ca/programmes-formations-et-admission/admission/",
    calendar: "https://www.uqar.ca/programmes-formations-et-admission/calendrier-universitaire/",
    studentLife: "https://www.uqar.ca/vie-etudiante/",
    directory: "https://annuaire.uqar.ca",
};

const DEFAULT_CONTACTS = [
    {
        title: "Campus de Rimouski",
        phone: "418 723-1986",
        email: "uqar@uqar.ca",
        address: "300, allée des Ursulines, Rimouski",
    },
    {
        title: "Campus de Lévis",
        phone: "418 833-8800",
        email: "campus_levis@uqar.ca",
        address: "1595, boulevard Alphonse-Desjardins, Lévis",
    },
    {
        title: "Guichet étudiant",
        phone: "Rimouski : poste 1530 | Lévis : poste 3222",
        email: "guichetrimouski@uqar.ca",
        secondaryEmail: "guichetlevis@uqar.ca",
        address: "Rimouski : local E-106 | Lévis : local 1011",
    },
];

function normalize(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function getResourceValue(resources, keys, fallback) {
    const entries = Object.entries(resources || {});
    const found = entries.find(([key]) => keys.some((candidate) => normalize(key).includes(candidate)));
    return found?.[1] || fallback;
}

export default function University() {
    const { id } = useParams();
    const { user } = useAuth();
    const [uni, setUni] = useState(null);
    const [loading, setLoading] = useState(true);

    const profileUniversity = user?.profile?.university;
    const profileUniversityInfo = user?.profile?.university_info;
    const universityId = id || profileUniversityInfo?.id || (profileUniversity && typeof profileUniversity === "object" ? profileUniversity.id : profileUniversity);

    useEffect(() => {
        setLoading(true);
        setUni(null);

        if (!universityId) {
            setLoading(false);
            return;
        }

        api.get(`/universities/${universityId}/`)
            .then((res) => setUni(res.data))
            .catch(() => setUni(null))
            .finally(() => setLoading(false));
    }, [universityId]);

    const pageData = useMemo(() => {
        const resources = uni?.resources_json || {};
        const website = uni?.website_url || getResourceValue(resources, ["site", "website", "officiel"], UQAR_LINKS.website);
        return {
            name: uni?.name || "Université du Québec à Rimouski (UQAR)",
            shortName: uni?.acronym || (normalize(uni?.name).includes("uqar") ? "UQAR" : "Université"),
            city: uni?.city || user?.profile?.city || "Rimouski",
            campus: user?.profile?.campus?.name || user?.profile?.campus || uni?.campus || "Rimouski / Lévis",
            website,
            portal: getResourceValue(resources, ["dossier", "portail"], UQAR_LINKS.portal),
            admission: getResourceValue(resources, ["admission"], UQAR_LINKS.admission),
            calendar: getResourceValue(resources, ["calendrier"], UQAR_LINKS.calendar),
            studentLife: getResourceValue(resources, ["vie", "services", "etudiante"], UQAR_LINKS.studentLife),
            directory: getResourceValue(resources, ["annuaire", "contact"], UQAR_LINKS.directory),
        };
    }, [uni, user]);

    if (loading) {
        return <div className="university-page"><div className="university-loader"><div className="spinner" /></div></div>;
    }

    if (!uni) {
        return (
            <div className="university-page">
                <div className="university-container">
                    <BackButton />
                    <div className="university-empty">
                        <div className="university-empty-icon">?</div>
                        <h1>Université introuvable</h1>
                        <p>Complète ton profil pour associer ton université et afficher les ressources utiles.</p>
                        <Link className="university-button primary" to="/onboarding">Compléter mon profil</Link>
                    </div>
                </div>
            </div>
        );
    }

    const mainResources = [
        {
            icon: "WEB",
            title: "Site officiel",
            description: "Portail principal de l'université pour retrouver les informations générales.",
            action: "Visiter le site",
            href: pageData.website,
        },
        {
            icon: "MD",
            title: "Mon dossier",
            description: "Accède à ton dossier étudiant, ton horaire et tes informations académiques.",
            action: "Ouvrir",
            href: pageData.portal,
        },
        {
            icon: "ADM",
            title: "Admission",
            description: "Informations pour les demandes d'admission et les étudiants internationaux.",
            action: "Consulter",
            href: pageData.admission,
        },
        {
            icon: "CAL",
            title: "Calendrier universitaire",
            description: "Dates importantes, trimestres, sessions, examens et échéances.",
            action: "Voir le calendrier",
            href: pageData.calendar,
        },
        {
            icon: "VIE",
            title: "Vie étudiante",
            description: "Découvre les services, activités et ressources d'accompagnement.",
            action: "Explorer",
            href: pageData.studentLife,
        },
        {
            icon: "DIR",
            title: "Annuaire et contacts",
            description: "Trouve un service, une personne ou une unité administrative.",
            action: "Ouvrir l'annuaire",
            href: pageData.directory,
        },
    ];

    const quickInfos = [
        ["Université", pageData.shortName],
        ["Ville", pageData.city],
        ["Campus", pageData.campus],
        ["Type", "Université publique"],
        ["Langue", "Français"],
        ["Profil", "Étudiants internationaux"],
    ];

    const recommended = [
        ["Comment s'inscrire aux cours", "Vérifier le portail et le cheminement de programme."],
        ["Comment payer les frais de scolarité", "Consulter l'état de compte et les modalités de paiement."],
        ["Où trouver son relevé de notes", "Passer par Mon dossier ou le service responsable."],
        ["Comment obtenir une preuve d'inscription", "Demander l'attestation depuis les services étudiants."],
        ["Qui contacter au campus de Lévis", "Utiliser le guichet étudiant ou l'annuaire."],
        ["Qui contacter au campus de Rimouski", "Joindre le guichet étudiant ou les services du campus."],
    ];

    return (
        <div className="university-page">
            <section className="university-hero">
                <div className="university-container">
                    <BackButton />
                    <div className="university-hero-grid">
                        <div className="university-hero-copy">
                            <span className="university-kicker">Mon université</span>
                            <h1>{pageData.name}</h1>
                            <p>
                                Découvre les ressources utiles, les liens officiels et les informations importantes pour réussir ton parcours universitaire.
                            </p>
                            <div className="university-hero-meta">
                                <span>{pageData.city}</span>
                                <span>{pageData.campus}</span>
                            </div>
                            <div className="university-hero-actions">
                                <a className="university-button primary" href={pageData.website} target="_blank" rel="noopener noreferrer">
                                    Visiter le site officiel
                                </a>
                                <a className="university-button ghost" href="#university-resources">
                                    Voir les ressources utiles
                                </a>
                            </div>
                        </div>
                        <div className="university-hero-card" aria-label="Résumé université">
                            <div className="university-mark">U</div>
                            <div>
                                <span>Campus principal</span>
                                <strong>{pageData.city}</strong>
                            </div>
                            <div>
                                <span>Portail étudiant</span>
                                <strong>Mon dossier</strong>
                            </div>
                            <div>
                                <span>Accompagnement</span>
                                <strong>Guichet étudiant</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="university-container university-main">
                <section className="university-section">
                    <div className="university-info-grid">
                        {quickInfos.map(([label, value]) => (
                            <article className="university-info-tile" key={label}>
                                <span>{label}</span>
                                <strong>{value || "Non renseigné"}</strong>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="university-section" id="university-resources">
                    <SectionHeader
                        eyebrow="Liens officiels"
                        title="Ressources principales"
                        description="Les acces rapides essentiels pour ton dossier, ton admission et ta vie universitaire."
                    />
                    <div className="university-resource-grid">
                        {mainResources.map((resource) => (
                            <ResourceCard key={resource.title} {...resource} />
                        ))}
                    </div>
                </section>

                <section className="university-section university-two-columns">
                    <div>
                        <SectionHeader
                            eyebrow="Recommandations"
                        title="Ressources recommandées"
                        description="Des raccourcis pratiques pour répondre aux questions les plus fréquentes."
                        />
                        <div className="university-recommended-list">
                            {recommended.map(([title, description]) => (
                                <Link className="university-recommended-item" to={`/assistant?question=${encodeURIComponent(title)}`} key={title}>
                                    <div>
                                        <strong>{title}</strong>
                                        <span>{description}</span>
                                    </div>
                                    <em aria-hidden="true">→</em>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <ContactsCard contacts={DEFAULT_CONTACTS} />
                </section>

                <section className="university-section university-actions-card">
                    <div>
                        <span className="university-kicker dark">Actions rapides</span>
                        <h2>Continue ton parcours avec les bons outils</h2>
                        <p>Utilise NouveauDépart pour poser une question, consulter tes guides ou avancer dans ta checklist.</p>
                    </div>
                    <div className="university-actions-grid">
                        <Link className="university-action" to="/assistant">Poser une question à NordikBot</Link>
                        <Link className="university-action" to="/study-success">Voir mes guides</Link>
                        <Link className="university-action" to="/checklist">Ouvrir ma checklist</Link>
                        <Link className="university-action" to="/dashboard">Retour au tableau de bord</Link>
                    </div>
                </section>
            </main>
        </div>
    );
}

function SectionHeader({ eyebrow, title, description }) {
    return (
        <div className="university-section-header">
            <span>{eyebrow}</span>
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    );
}

function ResourceCard({ icon, title, description, action, href }) {
    return (
        <article className="university-resource-card">
            <div className="university-resource-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer">
                    {action} <span aria-hidden="true">→</span>
                </a>
            ) : (
                <span className="university-muted">Lien à confirmer</span>
            )}
        </article>
    );
}

function ContactsCard({ contacts }) {
    return (
        <section className="university-contacts-card">
            <SectionHeader
                eyebrow="Contacts utiles"
                title="Services a joindre"
                description="Quelques points de contact pratiques pour obtenir une information ou être redirigé."
            />
            <div className="university-contact-list">
                {contacts.map((contact) => (
                    <article className="university-contact" key={contact.title}>
                        <h3>{contact.title}</h3>
                        <p><span>Tel.</span> <a href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}>{contact.phone}</a></p>
                        <p><span>Email</span> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
                        {contact.secondaryEmail && <p><span>Email</span> <a href={`mailto:${contact.secondaryEmail}`}>{contact.secondaryEmail}</a></p>}
                        <p><span>Lieu</span> {contact.address}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
