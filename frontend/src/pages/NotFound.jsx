import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="page-content" style={{ textAlign: "center", paddingTop: "5rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🗺️</div>
            <h1 style={{ marginBottom: "0.5rem" }}>Page introuvable</h1>
            <p className="text-muted" style={{ marginBottom: "2rem" }}>
                Cette page n'existe pas. Tu t'es peut-être perdu dans l'aventure !
            </p>
            <Link to="/dashboard" className="btn btn-primary btn-lg">
                Retour au tableau de bord
            </Link>
        </div>
    );
}
