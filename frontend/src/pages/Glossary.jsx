import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import "../styles/glossary.css";

const categories = ["Tous", "Université", "Immigration", "Administration", "Vie au Québec", "Emploi", "Expressions québécoises"];

const glossaryData = [
    {
        term: "NAS",
        category: "Administration",
        definition: "Numéro d'assurance sociale nécessaire pour travailler au Canada et accéder à certains services.",
        example: "J'ai besoin de mon NAS pour commencer mon emploi étudiant.",
    },
    {
        term: "CAQ",
        category: "Immigration",
        definition: "Certificat d'acceptation du Québec, souvent nécessaire avant de demander un permis d'études.",
        example: "Après mon admission, je dois vérifier si je dois demander un CAQ.",
    },
    {
        term: "Permis d'études",
        category: "Immigration",
        definition: "Document fédéral qui autorise un étudiant international à étudier au Canada.",
        example: "Mon permis d'études doit rester valide pendant ma formation.",
    },
    {
        term: "RAMQ",
        category: "Administration",
        definition: "Régie de l'assurance maladie du Québec, liée à la couverture de soins de santé.",
        example: "Je dois vérifier si je suis admissible à la RAMQ.",
    },
    {
        term: "Baccalauréat",
        category: "Université",
        definition: "Diplôme universitaire de premier cycle, souvent composé d'environ 90 crédits.",
        example: "Je commence un baccalauréat en informatique.",
    },
    {
        term: "Crédit",
        category: "Université",
        definition: "Unité qui mesure la charge d'un cours et la progression dans un programme.",
        example: "Ce cours vaut 3 crédits.",
    },
    {
        term: "Registrariat",
        category: "Université",
        definition: "Service administratif qui gère notamment les inscriptions, dossiers, attestations et relevés.",
        example: "Je contacte le registrariat pour une preuve d'inscription.",
    },
    {
        term: "Relevé de notes",
        category: "Université",
        definition: "Document officiel qui présente les cours suivis et les notes obtenues.",
        example: "Je dois fournir mon relevé de notes pour une demande administrative.",
    },
    {
        term: "Plan de cours",
        category: "Université",
        definition: "Document qui décrit les objectifs, les évaluations, les dates importantes et les règles d'un cours.",
        example: "Je lis mon plan de cours pour connaître les dates de remise.",
    },
    {
        term: "Session",
        category: "Université",
        definition: "Période d'études, par exemple automne, hiver ou été.",
        example: "Je commence ma première session à l'automne.",
    },
    {
        term: "Carte OPUS",
        category: "Vie au Québec",
        definition: "Carte rechargeable utilisée pour le transport en commun dans plusieurs villes du Québec.",
        example: "Je recharge ma carte OPUS pour prendre l'autobus.",
    },
    {
        term: "Bail",
        category: "Vie au Québec",
        definition: "Contrat de location entre un locataire et un propriétaire.",
        example: "Je lis le bail avant de signer mon logement.",
    },
    {
        term: "Emploi étudiant",
        category: "Emploi",
        definition: "Travail effectué pendant les études, selon les règles de ton statut et de ton permis.",
        example: "Je vérifie mes droits avant de chercher un emploi étudiant.",
    },
    {
        term: "Courriel",
        category: "Expressions québécoises",
        definition: "Mot utilisé au Québec pour parler d'un email.",
        example: "J'envoie un courriel à mon professeur.",
    },
];

const popularTerms = ["CAQ", "NAS", "Permis d'études", "Registrariat", "Relevé de notes", "Crédit", "Baccalauréat"];

export default function Glossary() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialSearch = searchParams.get("search") || "";
    const [search, setSearch] = useState(initialSearch);
    const [category, setCategory] = useState("Tous");

    useEffect(() => {
        setSearch(searchParams.get("search") || "");
    }, [searchParams]);

    function updateSearch(value) {
        setSearch(value);
        const next = new URLSearchParams(searchParams);
        if (value.trim()) next.set("search", value);
        else next.delete("search");
        setSearchParams(next, { replace: true });
    }

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return glossaryData.filter((item) => {
            const matchesCategory = category === "Tous" || item.category === category;
            const matchesSearch = !query
                || item.term.toLowerCase().includes(query)
                || item.definition.toLowerCase().includes(query)
                || item.example.toLowerCase().includes(query);
            return matchesCategory && matchesSearch;
        });
    }, [search, category]);

    return (
        <div className="glossary-page">
            <section className="glossary-hero">
                <div className="glossary-container">
                    <BackButton />
                    <div className="glossary-hero-grid">
                        <div>
                            <span className="glossary-kicker">Vocabulaire québécois</span>
                            <h1>Glossaire</h1>
                            <p>Comprends les mots importants de la vie universitaire et administrative au Québec.</p>
                            <small>Recherche rapidement un terme comme NAS, CAQ, baccalauréat, registrariat ou relevé de notes.</small>
                        </div>
                        <div className="glossary-popular">
                            <strong>Termes populaires</strong>
                            <div>
                                {popularTerms.map((term) => (
                                    <button key={term} type="button" onClick={() => updateSearch(term)}>{term}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="glossary-search">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => updateSearch(event.target.value)}
                            placeholder="Rechercher un terme : NAS, CAQ, Bac, registrariat..."
                        />
                    </div>
                </div>
            </section>

            <main className="glossary-container glossary-main">
                <div className="glossary-filters" aria-label="Filtres du glossaire">
                    {categories.map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={category === item ? "active" : ""}
                            onClick={() => setCategory(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="glossary-result-count">
                    {filtered.length === glossaryData.length
                        ? `${glossaryData.length} termes disponibles`
                        : `${filtered.length} résultat(s)${search ? ` pour "${search}"` : ""}`}
                </div>

                {filtered.length === 0 ? (
                    <section className="glossary-empty">
                        <div>?</div>
                        <h2>Aucun terme trouvé.</h2>
                        <p>Essaie un autre mot-clé ou demande directement une explication à NordikBot.</p>
                        <Link to={`/assistant?question=${encodeURIComponent(`Explique-moi le terme ${search || "universitaire"}`)}`}>Demander à NordikBot</Link>
                    </section>
                ) : (
                    <section className="glossary-grid">
                        {filtered.map((item) => (
                            <article className="glossary-card" id={slug(item.term)} key={item.term}>
                                <div className="glossary-card-head">
                                    <div className="glossary-term-icon">{item.term.slice(0, 2).toUpperCase()}</div>
                                    <div>
                                        <h2>{item.term}</h2>
                                        <span>{item.category}</span>
                                    </div>
                                </div>
                                <p>{item.definition}</p>
                                <div className="glossary-example">
                                    <strong>Exemple</strong>
                                    <span>{item.example}</span>
                                </div>
                                <Link to={`/assistant?question=${encodeURIComponent(`Explique-moi ${item.term}`)}`}>
                                    Poser une question à NordikBot
                                </Link>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}

function slug(value) {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
