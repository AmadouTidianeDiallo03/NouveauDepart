import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { updateMe } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import "../styles/onboarding.css";

const STAGES = [
    { value: "before_arrival", label: "Avant mon arrivée", desc: "Je prépare mon départ et mes documents." },
    { value: "arrival", label: "À mon arrivée", desc: "Je fais mes premières démarches au Québec." },
    { value: "after_arrival", label: "Après mon arrivée", desc: "Je m’installe dans ma vie universitaire." },
];

const NEEDS = [
    "Logement",
    "Transport",
    "Démarches administratives",
    "Vie universitaire",
    "Budget",
    "Emploi étudiant",
    "Intégration culturelle",
    "Études",
];

const COUNTRIES = ["", "Côte d’Ivoire", "Sénégal", "Cameroun", "Maroc", "Tunisie", "France", "Haïti", "Algérie", "Canada", "Autre"];

export default function Onboarding() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [universities, setUniversities] = useState([]);
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        role: "student",
        integration_stage: "arrival",
        university_id: "",
        campus: "",
        city: "",
        language: "fr",
        country_origin: "",
        program: "",
        help_topics: [],
        bio: "",
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        api.get("/universities/")
            .then((res) => {
                if (!mounted) return;
                const data = res.data.results || res.data;
                setUniversities(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error("Universities loading error:", err.response?.data || err.message);
                if (mounted) setError("Impossible de charger la liste des universités pour le moment.");
            })
            .finally(() => mounted && setInitialLoading(false));

        if (user) {
            const profile = user.profile || {};
            const profileUniversity = profile.university;
            const universityId = profile.university_info?.id || (profileUniversity && typeof profileUniversity === "object" ? profileUniversity.id : profileUniversity);
            setForm({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                role: profile.role === "newcomer" ? "student" : profile.role || "student",
                integration_stage: profile.integration_stage || "arrival",
                university_id: universityId ? String(universityId) : "",
                campus: profile.campus || "",
                city: profile.city || "",
                language: profile.language || "fr",
                country_origin: profile.country_origin || "",
                program: profile.program || "",
                help_topics: Array.isArray(profile.help_topics) ? profile.help_topics : [],
                bio: profile.bio || "",
            });
            if (profile.avatar_url) setAvatarPreview(profile.avatar_url);
        }

        return () => {
            mounted = false;
        };
    }, [user]);

    const selectedUniversity = universities.find((u) => String(u.id) === form.university_id);
    const isMentor = form.role === "mentor";
    const completion = useMemo(() => calculateCompletion(form), [form]);
    const avatarLetter = (form.first_name?.[0] || user?.email?.[0] || "N").toUpperCase();

    function updateField(name, value) {
        setForm((current) => ({ ...current, [name]: value }));
    }

    function handleInputChange(event) {
        const { name, value } = event.target;
        if (name === "university_id") {
            const university = universities.find((u) => String(u.id) === value);
            setForm((current) => ({
                ...current,
                university_id: value,
                city: university?.city || current.city,
            }));
            return;
        }
        updateField(name, value);
    }

    function toggleNeed(need) {
        setForm((current) => ({
            ...current,
            help_topics: current.help_topics.includes(need)
                ? current.help_topics.filter((item) => item !== need)
                : [...current.help_topics, need],
        }));
    }

    function handleAvatarChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);
        try {
            const universityId = form.university_id ? parseInt(form.university_id, 10) : null;
            const profileData = {
                role: form.role,
                university: universityId,
                campus: form.campus,
                city: form.city,
                language: form.language,
                languages: [form.language === "en" ? "English" : "Français"],
                country_origin: form.country_origin,
                program: form.program,
                help_topics: form.help_topics,
                integration_stage: form.integration_stage,
                bio: form.bio,
                onboarding_done: true,
            };

            if (avatarFile) {
                const fd = new FormData();
                fd.append("avatar", avatarFile);
                fd.append("first_name", form.first_name);
                fd.append("last_name", form.last_name);
                await api.patch("/auth/me/", fd, { headers: { "Content-Type": "multipart/form-data" } });
            }

            await updateMe({
                first_name: form.first_name,
                last_name: form.last_name,
                profile: profileData,
            });
            await refreshUser();
            setSuccess(true);
            setTimeout(() => navigate("/welcome"), 1000);
        } catch (err) {
            console.error("Onboarding save error:", err.response?.data || err.message);
            setError("Erreur lors de la sauvegarde du profil.");
        } finally {
            setLoading(false);
        }
    }

    if (initialLoading) {
        return (
            <div className="onboarding-page onboarding-loading">
                <div className="onboarding-spinner" />
                <p>Chargement du profil...</p>
            </div>
        );
    }

    return (
        <div className="onboarding-page">
            <OnboardingHero completion={completion} />
            <main className="onboarding-container">
                <BackButton />
                <OnboardingStepper completion={completion} />

                <form onSubmit={handleSubmit} className="onboarding-layout">
                    <div className="onboarding-main">
                        {error && <Alert type="error" text={error} />}
                        {success && <Alert type="success" text="Ton profil a bien été enregistré." />}

                        <AvatarUploadCard
                            avatarPreview={avatarPreview}
                            avatarLetter={avatarLetter}
                            selectedUniversity={selectedUniversity}
                            form={form}
                            fileInputRef={fileInputRef}
                            onAvatarChange={handleAvatarChange}
                        />

                        <FormSectionCard
                            icon="user"
                            title="Informations personnelles"
                            desc="Ces informations permettent de créer ton espace personnel."
                        >
                            <div className="field-grid two">
                                <Field label="Prénom" required valid={Boolean(form.first_name)}>
                                    <input name="first_name" value={form.first_name} onChange={handleInputChange} placeholder="Amadou" />
                                </Field>
                                <Field label="Nom de famille" required valid={Boolean(form.last_name)}>
                                    <input name="last_name" value={form.last_name} onChange={handleInputChange} placeholder="Diallo" />
                                </Field>
                            </div>

                            <div className="choice-grid">
                                <ChoiceCard active={form.role === "student"} title="Nouvel arrivant" desc="Je suis étudiant international." onClick={() => updateField("role", "student")} />
                                <ChoiceCard active={form.role === "mentor"} title="Mentor" desc="Je veux accompagner les étudiants." onClick={() => updateField("role", "mentor")} />
                            </div>

                            {!isMentor && (
                                <div className="stage-choice-grid">
                                    {STAGES.map((stage) => (
                                        <ChoiceCard
                                            key={stage.value}
                                            active={form.integration_stage === stage.value}
                                            title={stage.label}
                                            desc={stage.desc}
                                            onClick={() => updateField("integration_stage", stage.value)}
                                        />
                                    ))}
                                </div>
                            )}
                        </FormSectionCard>

                        <FormSectionCard
                            icon="school"
                            title="Université & localisation"
                            desc="Ton tableau de bord, ta checklist et tes ressources seront adaptés à ton contexte."
                        >
                            <Field label="Mon université" required valid={Boolean(form.university_id)}>
                                <select name="university_id" value={form.university_id} onChange={handleInputChange} required>
                                    <option value="">Choisir une université</option>
                                    {universities.map((university) => (
                                        <option key={university.id} value={university.id}>{university.name}</option>
                                    ))}
                                </select>
                            </Field>
                            <div className="field-grid two">
                                <Field label="Campus" valid={Boolean(form.campus)}>
                                    <input name="campus" value={form.campus} onChange={handleInputChange} placeholder="Rimouski, Lévis..." />
                                </Field>
                                <Field label="Ville" valid={Boolean(form.city)}>
                                    <input name="city" value={form.city} onChange={handleInputChange} placeholder="Lévis, Québec, Montréal..." />
                                </Field>
                            </div>
                        </FormSectionCard>

                        <FormSectionCard
                            icon="spark"
                            title="Préférences"
                            desc="Aide NouveauDépart à te proposer les bons guides, mentors et conseils."
                        >
                            <div className="language-toggle">
                                <button type="button" className={form.language === "fr" ? "active" : ""} onClick={() => updateField("language", "fr")}>Français</button>
                                <button type="button" className={form.language === "en" ? "active" : ""} onClick={() => updateField("language", "en")}>English</button>
                            </div>

                            <div className="field-grid two">
                                <Field label="Pays d’origine" valid={Boolean(form.country_origin)}>
                                    <select name="country_origin" value={form.country_origin} onChange={handleInputChange}>
                                        {COUNTRIES.map((country) => (
                                            <option key={country || "empty"} value={country}>{country || "Choisir un pays"}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Programme ou domaine d’études" valid={Boolean(form.program)}>
                                    <input name="program" value={form.program} onChange={handleInputChange} placeholder="Informatique, gestion, biologie..." />
                                </Field>
                            </div>

                            <div>
                                <label className="field-label">Besoins principaux</label>
                                <div className="needs-grid">
                                    {NEEDS.map((need) => (
                                        <button
                                            key={need}
                                            type="button"
                                            className={form.help_topics.includes(need) ? "selected" : ""}
                                            onClick={() => toggleNeed(need)}
                                        >
                                            {need}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {isMentor && (
                                <Field label="Présentation mentor" valid={Boolean(form.bio)}>
                                    <textarea name="bio" value={form.bio} onChange={handleInputChange} placeholder="Présente ton parcours, ton université et les sujets sur lesquels tu peux aider..." />
                                </Field>
                            )}
                        </FormSectionCard>
                    </div>

                    <aside className="onboarding-side">
                        <ProfilePreviewCard form={form} selectedUniversity={selectedUniversity} avatarPreview={avatarPreview} avatarLetter={avatarLetter} completion={completion} />
                        <WhyInfoCard />
                        <SaveProfileBar loading={loading} disabled={!form.university_id || loading} />
                    </aside>
                </form>
            </main>
        </div>
    );
}

function OnboardingHero({ completion }) {
    return (
        <section className="onboarding-hero">
            <div className="onboarding-hero-inner">
                <div>
                    <span>Bienvenue sur NouveauDépart</span>
                    <h1>Complétons ton profil</h1>
                    <p>Quelques informations suffisent pour personnaliser ton expérience sur NouveauDépart.</p>
                    <p className="hero-note">Ces informations nous aideront à te proposer le bon parcours, les bons guides et les bonnes ressources.</p>
                </div>
                <div className="hero-visual-card">
                    <ProgressRing value={completion} />
                    <strong>{completion}% complété</strong>
                    <span>Ton espace se prépare progressivement.</span>
                </div>
            </div>
        </section>
    );
}

function OnboardingStepper({ completion }) {
    const steps = ["Informations personnelles", "Université & localisation", "Préférences", "Confirmation"];
    const activeIndex = completion >= 90 ? 3 : completion >= 60 ? 2 : completion >= 30 ? 1 : 0;
    return (
        <section className="onboarding-stepper">
            <div className="stepper-progress"><span style={{ width: `${completion}%` }} /></div>
            {steps.map((step, index) => (
                <div className={index <= activeIndex ? "active" : ""} key={step}>
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                </div>
            ))}
        </section>
    );
}

function AvatarUploadCard({ avatarPreview, avatarLetter, selectedUniversity, form, fileInputRef, onAvatarChange }) {
    return (
        <section className="avatar-upload-card">
            <button type="button" className="avatar-circle" onClick={() => fileInputRef.current?.click()}>
                {avatarPreview ? <img src={avatarPreview} alt="Avatar" /> : avatarLetter}
            </button>
            <div>
                <span>Profil personnalisé</span>
                <h2>{[form.first_name, form.last_name].filter(Boolean).join(" ") || "Ton nom apparaîtra ici"}</h2>
                <p>{selectedUniversity?.name || "Aucune université sélectionnée"}</p>
                <button type="button" onClick={() => fileInputRef.current?.click()}>Changer la photo</button>
                <small>Ajoute une photo pour personnaliser ton profil. Tu pourras la modifier plus tard.</small>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarChange} hidden />
        </section>
    );
}

function FormSectionCard({ icon, title, desc, children }) {
    return (
        <section className="form-section-card">
            <div className="form-section-head">
                <span><Icon name={icon} /></span>
                <div>
                    <h2>{title}</h2>
                    <p>{desc}</p>
                </div>
            </div>
            <div className="form-section-body">{children}</div>
        </section>
    );
}

function Field({ label, required, valid, children }) {
    return (
        <label className={`field-control ${valid ? "valid" : ""}`}>
            <span className="field-label">{label}{required ? " *" : ""}</span>
            {children}
        </label>
    );
}

function ChoiceCard({ active, title, desc, onClick }) {
    return (
        <button type="button" className={`choice-card ${active ? "active" : ""}`} onClick={onClick}>
            <strong>{title}</strong>
            <span>{desc}</span>
        </button>
    );
}

function ProfilePreviewCard({ form, selectedUniversity, avatarPreview, avatarLetter, completion }) {
    return (
        <section className="preview-card">
            <div className="preview-head">
                <div className="preview-avatar">{avatarPreview ? <img src={avatarPreview} alt="" /> : avatarLetter}</div>
                <div>
                    <span>Aperçu personnalisé</span>
                    <strong>{[form.first_name, form.last_name].filter(Boolean).join(" ") || "Profil NouveauDépart"}</strong>
                </div>
            </div>
            <PreviewRow label="Tu es actuellement" value={form.role === "mentor" ? "Mentor" : "Nouvel arrivant"} />
            <PreviewRow label="Étape" value={STAGES.find((stage) => stage.value === form.integration_stage)?.label || "Non définie"} />
            <PreviewRow label="Université" value={selectedUniversity?.name || "Non choisie"} />
            <PreviewRow label="Campus / ville" value={[form.campus, form.city].filter(Boolean).join(" · ") || "Non indiqué"} />
            <PreviewRow label="Langue" value={form.language === "en" ? "English" : "Français"} />
            <div className="preview-progress"><span style={{ width: `${completion}%` }} /></div>
            <small>Ton parcours sera adapté à ton étape actuelle.</small>
        </section>
    );
}

function PreviewRow({ label, value }) {
    return (
        <div className="preview-row">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

function WhyInfoCard() {
    return (
        <section className="why-info-card">
            <span><Icon name="spark" /></span>
            <h2>Pourquoi ces informations ?</h2>
            <p>Ces informations nous permettent de personnaliser ton tableau de bord, ta checklist, tes mentors recommandés et tes ressources utiles.</p>
            <ul>
                <li>Tu pourras les modifier plus tard.</li>
                <li>Ton parcours sera mieux adapté.</li>
                <li>Les recommandations seront plus pertinentes.</li>
            </ul>
        </section>
    );
}

function SaveProfileBar({ loading, disabled }) {
    return (
        <section className="save-profile-card">
            <div>
                <strong>Finalisation</strong>
                <span>Nous utilisons ton profil pour mieux t’accompagner.</span>
            </div>
            <button type="submit" disabled={disabled}>
                {loading ? "Sauvegarde..." : "Continuer vers mon espace"}
            </button>
        </section>
    );
}

function Alert({ type, text }) {
    return <div className={`onboarding-alert ${type}`}>{text}</div>;
}

function ProgressRing({ value }) {
    return (
        <div className="onboarding-ring" style={{ "--progress": `${value * 3.6}deg` }}>
            <div>{value}%</div>
        </div>
    );
}

function calculateCompletion(form) {
    const checks = [
        form.first_name,
        form.last_name,
        form.role,
        form.integration_stage,
        form.university_id,
        form.city,
        form.language,
        form.country_origin,
        form.program,
        form.help_topics.length,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function Icon({ name }) {
    const paths = {
        user: "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
        school: "M3 8.5 12 4l9 4.5-9 4.5L3 8.5Zm4 3.5v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V12",
        spark: "M12 2l2.3 6.7L21 11l-6.7 2.3L12 20l-2.3-6.7L3 11l6.7-2.3L12 2Z",
    };
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={paths[name] || paths.spark} />
        </svg>
    );
}
