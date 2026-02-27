import { useState } from "react";

const glossaryData = [
    { term: "AE (Auxiliaire d'enseignement)", emoji: "🎓", definition: "Étudiant·e de cycle supérieur qui aide à animer les travaux pratiques (labs) et à corriger les travaux." },
    { term: "Association étudiante", emoji: "🤝", definition: "Organisation qui représente les étudiants d'un programme ou d'une faculté." },
    { term: "Baccalauréat (Bac)", emoji: "🏆", definition: "Diplôme de 1er cycle universitaire (3 ans, 90 crédits). ⚠️ Différent du baccalauréat français !" },
    { term: "CÉGEP", emoji: "🏫", definition: "Collège d'enseignement général et professionnel. Étape entre le secondaire et l'université au Québec." },
    { term: "Code permanent", emoji: "🔑", definition: "Identifiant unique émis par le ministère de l'Éducation du Québec (ex: TREM12345678)." },
    { term: "Contingentement", emoji: "🚦", definition: "Programme où le nombre de places est limité et l'admission sélective." },
    { term: "Cote R", emoji: "📈", definition: "Note de rendement au collégial utilisée pour l'admission à l'université." },
    { term: "Examen intra (midterm)", emoji: "📝", definition: "Examen de mi-session (octobre pour l'automne, février pour l'hiver)." },
    { term: "Matricule", emoji: "🪪", definition: "Numéro d'identification étudiant propre à votre université." },
    { term: "NAS (Numéro d'assurance sociale)", emoji: "🏦", definition: "Indispensable pour travailler légalement au Canada." },
    { term: "Plan de cours (Syllabus)", emoji: "📋", definition: "Document décrivant les objectifs, évaluations et règles d'un cours." },
    { term: "RAMQ", emoji: "🏥", definition: "Régie de l'assurance maladie du Québec." },
    { term: "Registrariat", emoji: "🏛️", definition: "Service administratif gérant les inscriptions, notes et diplômes." },
    { term: "Session", emoji: "📅", definition: "Semestre universitaire (Automne, Hiver, Été)." },
    { term: "CAQ (Certificat d'acceptation du Québec)", emoji: "📄", definition: "Document nécessaire avant d'obtenir le permis d'études canadien pour étudier au Québec." },
    { term: "Opus (Carte OPUS)", emoji: "🚌", definition: "Carte de transport en commun rechargeable utilisée dans plusieurs villes du Québec." },
];

export default function Glossary() {
    const [search, setSearch] = useState("");

    const filtered = glossaryData.filter(item =>
        item.term.toLowerCase().includes(search.toLowerCase()) ||
        item.definition.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-content" style={{ background: "linear-gradient(180deg, #faf5ff 0%, #f8fafc 100%)", minHeight: "100vh" }}>
            {/* Hero */}
            <div style={{
                background: "linear-gradient(135deg, #4c1d95, #7c3aed, #8b5cf6)",
                padding: "2.5rem 0 5rem",
                marginBottom: "-3rem",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{ position: "absolute", top: -50, right: -50, width: 260, height: 260, borderRadius: "50%", background: "rgba(167,139,250,0.25)" }} />
                <div className="container container-sm">
                    <div style={{ color: "#c4b5fd", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                        📖 Vocabulaire québécois
                    </div>
                    <h1 style={{ color: "#fff", marginBottom: "0.4rem" }}>Glossaire</h1>
                    <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: "1.75rem", fontSize: "0.95rem" }}>
                        Comprendre le vocabulaire universitaire et administratif du Québec — aucune surprise !
                    </p>

                    {/* Search bar inside hero */}
                    <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", fontSize: "1.1rem", pointerEvents: "none" }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Rechercher un terme (ex: NAS, CÉGEP, Bac...)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.85rem 1rem 0.85rem 2.75rem",
                                borderRadius: "14px",
                                border: "none",
                                fontSize: "0.95rem",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                outline: "none",
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="container container-sm" style={{ position: "relative", zIndex: 1 }}>
                {/* Count badge */}
                <div style={{ marginBottom: "1.25rem", fontSize: "0.88rem", color: "#64748b", fontWeight: 600 }}>
                    {filtered.length === glossaryData.length
                        ? `${glossaryData.length} termes disponibles`
                        : `${filtered.length} résultat(s) pour "${search}"`
                    }
                </div>

                {filtered.length === 0 ? (
                    <div style={{
                        background: "#fff", borderRadius: "20px", padding: "3rem",
                        textAlign: "center", color: "#94a3b8", boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                    }}>
                        <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔎</div>
                        <div style={{ fontWeight: 700 }}>Aucun terme trouvé</div>
                        <div style={{ fontSize: "0.88rem", marginTop: "0.3rem" }}>Essaie un autre mot-clé</div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {filtered.map((item, idx) => (
                            <div key={idx} style={{
                                background: "#fff",
                                borderRadius: "16px",
                                padding: "1.1rem 1.5rem",
                                display: "flex",
                                gap: "1rem",
                                alignItems: "flex-start",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                border: "1px solid #f1f5f9",
                                transition: "transform 0.15s, box-shadow 0.15s",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.borderColor = "#8b5cf6"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.borderColor = "#f1f5f9"; }}
                            >
                                <div style={{
                                    width: 42, height: 42, borderRadius: "12px", flexShrink: 0,
                                    background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.25rem",
                                }}>
                                    {item.emoji}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: "#4c1d95", marginBottom: "0.25rem", fontSize: "0.95rem" }}>{item.term}</div>
                                    <div style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.6 }}>{item.definition}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
