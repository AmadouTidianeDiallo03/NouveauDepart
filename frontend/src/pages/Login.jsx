import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

const FEATURES = [
    { icon: "guide", title: "Guide complet", desc: "Un parcours clair pour ton installation au Quebec." },
    { icon: "mentor", title: "Mentors dedies", desc: "Des etudiants experimentes pour t'accompagner." },
    { icon: "ai", title: "Assistant IA", desc: "NordikBot repond naturellement a tes questions." },
];

function AuthIcon({ name }) {
    const paths = {
        guide: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Zm0 0V21",
        mentor: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87",
        ai: "M12 8V4m0 4h5a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3h5Zm-4 5h.01M16 13h.01M9 17h6",
        eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
        eyeOff: "M3 3l18 18M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.8M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-3.1 4.2M6.4 6.5C3.5 8.3 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1",
        arrow: "M5 12h14m-6-6 6 6-6 6",
    };

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={paths[name] || paths.guide} />
        </svg>
    );
}

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Entre ton adresse courriel et ton mot de passe.");
            return;
        }

        setLoading(true);
        try {
            await login(email.trim(), password);
            await refreshUser();
            navigate("/welcome");
        } catch (err) {
            const detail = err.response?.data?.detail || err.response?.data?.email || err.response?.data?.password;
            setError(detail || err.message || "Identifiants invalides.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-brand-panel login-brand">
                <div className="auth-orb auth-orb-one" />
                <div className="auth-orb auth-orb-two" />
                <div className="auth-brand-content">
                    <Link to="/" className="auth-logo">
                        <span>ND</span>
                        NouveauDepart
                    </Link>
                    <div className="auth-brand-copy">
                        <p>Ton guide d'integration au Quebec</p>
                        <h1>Reprends ton parcours la ou tu l'as laisse.</h1>
                        <span>Checklist, mentors, budget et NordikBot reunis dans un espace clair.</span>
                    </div>
                    <div className="auth-feature-list">
                        {FEATURES.map((feature) => (
                            <div className="auth-feature" key={feature.title}>
                                <span><AuthIcon name={feature.icon} /></span>
                                <div>
                                    <strong>{feature.title}</strong>
                                    <p>{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="auth-form-panel">
                <div className="auth-card">
                    <div className="auth-form-heading">
                        <span>Connexion securisee</span>
                        <h2>Bon retour !</h2>
                        <p>Connecte-toi pour continuer ton aventure.</p>
                    </div>

                    {error && <div className="auth-alert" role="alert">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <label className="auth-field" htmlFor="login-email">
                            <span>Adresse courriel</span>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                autoFocus
                                placeholder="ton@courriel.com"
                            />
                        </label>

                        <label className="auth-field" htmlFor="login-password">
                            <span>Mot de passe</span>
                            <div className="password-field">
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    placeholder="Ton mot de passe"
                                />
                                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                                    <AuthIcon name={showPassword ? "eyeOff" : "eye"} />
                                </button>
                            </div>
                        </label>

                        <div className="auth-form-row">
                            <span>Session etudiante NouveauDepart</span>
                            <a href="#forgot-password">Mot de passe oublie ?</a>
                        </div>

                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading ? "Connexion en cours..." : "Se connecter"}
                            {!loading && <AuthIcon name="arrow" />}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Pas encore de compte ? <Link to="/register">S'inscrire gratuitement</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
