import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

const STEPS = [
    { title: "Etudiant international", text: "Cree ton espace personnel." },
    { title: "Arrivee au Quebec", text: "Complete ton profil et ton etape." },
    { title: "Installation reussie", text: "Avance avec ta checklist et tes mentors." },
];

function AuthIcon({ name }) {
    const paths = {
        eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
        eyeOff: "M3 3l18 18M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.8M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-3.1 4.2M6.4 6.5C3.5 8.3 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1",
        arrow: "M5 12h14m-6-6 6 6-6 6",
    };

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={paths[name] || paths.arrow} />
        </svg>
    );
}

export default function Register() {
    const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const passwordScore = useMemo(() => {
        let score = 0;
        if (form.password.length >= 6) score += 1;
        if (form.password.length >= 10) score += 1;
        if (/[0-9]/.test(form.password)) score += 1;
        if (/[A-Z]/.test(form.password)) score += 1;
        return Math.min(score, 4);
    }, [form.password]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }
    }

    function handleBlur(e) {
        setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    }

    function validate() {
        const errors = {};
        if (!form.first_name.trim()) errors.first_name = "Le prenom est obligatoire.";
        if (!form.last_name.trim()) errors.last_name = "Le nom est obligatoire.";
        if (!form.email.trim()) errors.email = "Le courriel est obligatoire.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Courriel invalide.";
        if (!form.password) errors.password = "Le mot de passe est obligatoire.";
        else if (form.password.length < 6) errors.password = "Minimum 6 caracteres.";
        return errors;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setTouched({ first_name: true, last_name: true, email: true, password: true });
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        try {
            await register({
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            await refreshUser();
            navigate("/onboarding");
        } catch (err) {
            const data = err.response?.data;
            if (data && typeof data === "object") {
                const msgs = Object.entries(data)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" ") : value}`)
                    .join(" ");
                setError(msgs);
            } else {
                setError(err.message || "Erreur lors de l'inscription.");
            }
        } finally {
            setLoading(false);
        }
    }

    function FieldError({ name }) {
        return touched[name] && fieldErrors[name] ? <small className="field-error">{fieldErrors[name]}</small> : null;
    }

    return (
        <main className="auth-page register-page">
            <section className="auth-brand-panel register-brand">
                <div className="auth-orb auth-orb-one" />
                <div className="auth-orb auth-orb-two" />
                <div className="auth-brand-content">
                    <Link to="/" className="auth-logo">
                        <span>ND</span>
                        NouveauDepart
                    </Link>
                    <div className="auth-brand-copy">
                        <p>Rejoins la communaute des aujourd'hui</p>
                        <h1>Commence ton integration avec un espace fait pour toi.</h1>
                        <span>Inscription en moins de 30 secondes, gratuite et sans carte requise.</span>
                    </div>
                    <div className="auth-step-list">
                        {STEPS.map((step, index) => (
                            <div className="auth-step" key={step.title}>
                                <span>{index + 1}</span>
                                <div>
                                    <strong>{step.title}</strong>
                                    <p>{step.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="auth-note">Tu pourras completer ton profil juste apres l'inscription.</div>
                </div>
            </section>

            <section className="auth-form-panel">
                <div className="auth-card">
                    <div className="auth-form-heading">
                        <span>Nouveau compte</span>
                        <h2>Creer mon compte</h2>
                        <p>Commence ton aventure quebecoise avec NouveauDepart.</p>
                    </div>

                    {error && <div className="auth-alert" role="alert">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="auth-two-columns">
                            <label className={`auth-field ${fieldErrors.first_name ? "has-error" : ""}`} htmlFor="reg-firstname">
                                <span>Prenom</span>
                                <input id="reg-firstname" name="first_name" type="text" value={form.first_name} onChange={handleChange} onBlur={handleBlur} placeholder="Mohamed" autoComplete="given-name" />
                                <FieldError name="first_name" />
                            </label>
                            <label className={`auth-field ${fieldErrors.last_name ? "has-error" : ""}`} htmlFor="reg-lastname">
                                <span>Nom</span>
                                <input id="reg-lastname" name="last_name" type="text" value={form.last_name} onChange={handleChange} onBlur={handleBlur} placeholder="Diallo" autoComplete="family-name" />
                                <FieldError name="last_name" />
                            </label>
                        </div>

                        <label className={`auth-field ${fieldErrors.email ? "has-error" : ""}`} htmlFor="reg-email">
                            <span>Adresse courriel</span>
                            <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="ton@courriel.com" autoComplete="email" />
                            <FieldError name="email" />
                        </label>

                        <label className={`auth-field ${fieldErrors.password ? "has-error" : ""}`} htmlFor="reg-password">
                            <span>Mot de passe</span>
                            <div className="password-field">
                                <input id="reg-password" name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} onBlur={handleBlur} placeholder="Minimum 6 caracteres" autoComplete="new-password" />
                                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                                    <AuthIcon name={showPassword ? "eyeOff" : "eye"} />
                                </button>
                            </div>
                            <FieldError name="password" />
                            <div className="password-strength" aria-hidden="true">
                                {[0, 1, 2, 3].map((index) => <span key={index} className={index < passwordScore ? "active" : ""} />)}
                            </div>
                            <small className="field-hint">Ajoute quelques caracteres, une majuscule ou un chiffre pour renforcer ton mot de passe.</small>
                        </label>

                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading ? "Creation du compte..." : "Creer mon compte"}
                            {!loading && <AuthIcon name="arrow" />}
                        </button>
                    </form>

                    <p className="auth-legal">En creant un compte, tu acceptes les conditions d'utilisation et la politique de confidentialite.</p>
                    <p className="auth-switch">
                        Deja un compte ? <Link to="/login">Se connecter</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
