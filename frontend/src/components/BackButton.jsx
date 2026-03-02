import { useNavigate } from "react-router-dom";

/**
 * Reusable BackButton component for sub-pages.
 * @param {string} [to] - Optional path to navigate back to. If not provided, goes back in history.
 * @param {string} [label] - Optional label for the button. Defaults to "Retour".
 */
export default function BackButton({ to, label = "Retour" }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (to) {
            navigate(to);
        } else if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <button
            onClick={handleBack}
            className="btn btn-ghost btn-sm btn-back"
            style={{ marginBottom: "1.5rem", paddingLeft: 0 }}
        >
            <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>←</span>
            <span>{label}</span>
        </button>
    );
}
