import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/auth";
import { useAuth } from "../context/AuthContext";


export default function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return <div className="loading-screen"><div className="spinner" /></div>;
    }

    if (user?.role !== "admin") {
        return (
            <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f6f8fc", padding: "1rem" }}>
                <div style={{ maxWidth: 560, background: "#fff", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 18, padding: "1.4rem", fontWeight: 900, boxShadow: "0 18px 45px rgba(15,23,42,.08)" }}>
                    Accès refusé. Cette section est réservée aux administrateurs.
                </div>
            </div>
        );
    }

    return children;
}
