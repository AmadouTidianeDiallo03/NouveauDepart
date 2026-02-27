const sections = [
    {
        icon: "📊", title: "Système de crédits", gradient: "linear-gradient(135deg, #2563eb, #6366f1)",
        content: [
            "Un cours universitaire vaut généralement **3 crédits**.",
            "Un **baccalauréat** (Bac) dure 3 ans et nécessite **90 crédits** (environ 30 par année).",
            "Une session (semestre) à temps plein = 15 crédits = 5 cours.",
            "Les **cours obligatoires** font partie de ton programme ; les **cours à option** sont au choix.",
            "Vérifie ta grille de programme sur le portail de ton université.",
        ],
    },
    {
        icon: "📝", title: "Évaluations & Notes", gradient: "linear-gradient(135deg, #0ea5e9, #2563eb)",
        content: [
            "Le **plan de cours** (syllabus) détaille toutes les évaluations dès le premier cours.",
            "Pondération typique : travaux (30–40%) + examen mi-session (20–30%) + examen final (30–40%).",
            "La note de passage est généralement **60%** (mais varie selon le programme).",
            "Les notes sont exprimées en **%** ou en **lettres** (A, B, C, D, E/F).",
            "La **cote Z** (ou GPA québécois) est utilisée pour certains concours d'admission.",
        ],
    },
    {
        icon: "🗓", title: "Organisation & Calendrier", gradient: "linear-gradient(135deg, #8b5cf6, #6366f1)",
        content: [
            "**Session d'automne** : septembre → décembre",
            "**Session d'hiver** : janvier → avril",
            "**Session d'été** (optionnelle) : mai → août",
            "Les dates importantes sont publiées sur le calendrier universitaire officiel.",
            "Inscris-toi aux cours dans les délais : les places partent vite !",
        ],
    },
    {
        icon: "📖", title: "Méthodes d'étude efficaces", gradient: "linear-gradient(135deg, #10b981, #0ea5e9)",
        content: [
            "**Technique Pomodoro** : 25 min de travail → 5 min de pause (× 4 → longue pause).",
            "**Méthode Cornell** : prendre des notes structurées en colonnes.",
            "Révise régulièrement plutôt qu'en bourrage la veille de l'examen.",
            "Forme des **groupes d'étude** avec tes collègues de cours.",
            "Utilise les ressources de la bibliothèque : bases de données, salles silencieuses.",
        ],
    },
    {
        icon: "🆘", title: "Où demander de l'aide", gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
        content: [
            "**Ton professeur / chargé de cours** : pendant les heures de bureau.",
            "**Ton conseiller pédagogique** : pour les questions de parcours et de cours.",
            "**Centre d'aide à la rédaction** : pour améliorer tes travaux écrits.",
            "**Service de soutien psychologique** : stress, anxiété, gestion des émotions.",
            "**Ton mentor NouveauDépart** : un étudiant expérimenté prêt à t'aider !",
        ],
    },
    {
        icon: "⚠️", title: "Intégrité académique", gradient: "linear-gradient(135deg, #dc2626, #f59e0b)",
        content: [
            "**Le plagiat est une faute grave.** Cite toujours tes sources (APA, Chicago, MLA…).",
            "Paraphraser sans citer est aussi du plagiat.",
            "La plupart des universités utilisent **Turnitin** ou un logiciel similaire.",
            "En cas de doute : demande à ton prof avant de soumettre.",
            "Consulte la politique d'intégrité académique de ton université.",
        ],
    },
];

function renderMd(text) {
    return <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
}

export default function StudySuccess() {
    return (
        <div className="page-content" style={{ background: "linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%)", minHeight: "100vh" }}>
            {/* Hero */}
            <div style={{
                background: "linear-gradient(135deg, #1e3a5f, #1d4ed8, #4338ca)",
                padding: "2.5rem 0 4.5rem",
                marginBottom: "-2.5rem",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{ position: "absolute", top: -50, right: -50, width: 250, height: 250, borderRadius: "50%", background: "rgba(99,102,241,0.2)" }} />
                <div style={{ position: "absolute", bottom: -30, left: "20%", width: 150, height: 150, borderRadius: "50%", background: "rgba(59,130,246,0.2)" }} />
                <div className="container">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: "18px",
                            background: "rgba(255,255,255,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "2rem", flexShrink: 0,
                        }}>📚</div>
                        <div>
                            <h1 style={{ color: "#fff", marginBottom: "0.3rem" }}>Réussite Académique</h1>
                            <p style={{ color: "rgba(255,255,255,0.75)", margin: 0, fontSize: "0.95rem" }}>
                                Tout ce que tu dois savoir pour exceller à l'université québécoise.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ position: "relative", zIndex: 1 }}>
                {/* Quick nav chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
                    {sections.map((sec) => (
                        <a key={sec.title} href={`#section-${sec.title}`} style={{
                            background: "#fff", border: "1px solid #e2e8f0", borderRadius: "999px",
                            padding: "0.35rem 0.9rem", fontSize: "0.82rem", fontWeight: 600, color: "#0f172a",
                            textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "all 0.2s",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#2563eb"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                        >
                            {sec.icon} {sec.title}
                        </a>
                    ))}
                </div>

                <div className="grid grid-2">
                    {sections.map((sec) => (
                        <div id={`section-${sec.title}`} key={sec.title} style={{
                            background: "#fff",
                            borderRadius: "20px",
                            overflow: "hidden",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                            border: "1px solid #f1f5f9",
                            transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"; }}
                        >
                            {/* Card header with gradient */}
                            <div style={{
                                background: sec.gradient,
                                padding: "1rem 1.5rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                            }}>
                                <div style={{ fontSize: "1.6rem" }}>{sec.icon}</div>
                                <h3 style={{ color: "#fff", margin: 0, fontSize: "1rem", fontWeight: 700 }}>{sec.title}</h3>
                            </div>
                            {/* Card body */}
                            <div style={{ padding: "1.25rem 1.5rem" }}>
                                <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem", margin: 0 }}>
                                    {sec.content.map((item, i) => (
                                        <li key={i} style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.6 }}>
                                            {renderMd(item)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
