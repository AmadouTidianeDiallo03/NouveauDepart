import { Component } from "react";


export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error("React render error:", error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f6f8fc", padding: "1rem" }}>
                    <div style={{ maxWidth: 620, background: "#fff", border: "1px solid #fecaca", borderRadius: 18, padding: "1.25rem", boxShadow: "0 18px 45px rgba(15,23,42,.08)" }}>
                        <h1 style={{ margin: "0 0 .5rem", color: "#991b1b" }}>Une erreur d’affichage est survenue.</h1>
                        <p style={{ color: "#64748b", lineHeight: 1.5 }}>
                            Recharge la page. Si le problème continue, ouvre la console du navigateur pour voir le message technique.
                        </p>
                        <pre style={{ whiteSpace: "pre-wrap", background: "#f8fafc", borderRadius: 12, padding: ".8rem", color: "#991b1b" }}>
                            {this.state.error.message}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
