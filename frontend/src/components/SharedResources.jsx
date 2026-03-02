import PropTypes from "prop-types";

export default function SharedResources({ resources, onAddResource, isLoading }) {
    const getIcon = (type) => {
        const icons = {
            document: "📄",
            video: "🎥",
            link: "🔗",
            article: "📰",
            guide: "📚",
        };
        return icons[type] || "📎";
    };

    return (
        <div
            style={{
                background: "#f8fafc",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1rem",
                border: "1px solid #e2e8f0",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1rem" }}>📚 Ressources partagées</h4>
                <button
                    onClick={onAddResource}
                    style={{
                        background: "#6366f1",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.5rem 1rem",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
                >
                    + Ajouter
                </button>
            </div>

            {isLoading ? (
                <p style={{ color: "#94a3b8", fontStyle: "italic" }}>Chargement...</p>
            ) : resources && resources.length > 0 ? (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {resources.map((res) => (
                        <a
                            key={res.id}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "block",
                                padding: "0.75rem",
                                marginBottom: "0.5rem",
                                background: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                textDecoration: "none",
                                color: "inherit",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#f0f9ff";
                                e.currentTarget.style.borderColor = "#0ea5e9";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#fff";
                                e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                        >
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                                <span style={{ fontSize: "1.2rem", minWidth: "1.5rem" }}>
                                    {getIcon(res.resource_type)}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: "0 0 0.25rem 0", fontWeight: 600, color: "#0369a1", fontSize: "0.9rem", wordBreak: "break-word" }}>
                                        {res.title}
                                    </p>
                                    {res.description && (
                                        <p style={{ margin: "0 0 0.25rem 0", color: "#64748b", fontSize: "0.8rem", wordBreak: "break-word" }}>
                                            {res.description}
                                        </p>
                                    )}
                                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.75rem" }}>
                                        {new Date(res.created_at).toLocaleDateString("fr-CA")}
                                    </p>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <p style={{ color: "#94a3b8", fontStyle: "italic", margin: 0 }}>
                    Aucune ressource partagée pour le moment.
                </p>
            )}
        </div>
    );
}

SharedResources.propTypes = {
    resources: PropTypes.array,
    onAddResource: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};
