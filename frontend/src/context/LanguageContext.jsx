import { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";

const LanguageContext = createContext();

const translations = {
    fr: {
        // Navbar
        dashboard: "Tableau de bord",
        checklist: "Checklist",
        mentors: "Mentors",
        messages: "Messages",
        ia: "IA",
        glossary: "Glossaire",
        map: "Carte",
        university: "Université",
        profile: "Profil",
        logout: "Déconnexion",
        student: "Étudiant",
        mentor: "Mentor",

        // Welcome/Dashboard
        welcome_back: "Bon retour,",
        how_can_i_help: "Comment puis-je t'aider aujourd'hui ?",
        discover_quebec: "Découvre ton nouveau milieu de vie et simplifie tes démarches.",
        my_path: "Mon parcours",
        integration_checklist: "Checklist d'intégration",
        track_steps: "Suis tes étapes administratives",
        find_mentor: "Trouver un mentor",
        get_accompanied: "Fais-toi accompagner par un pro",
        ask_ia: "Demander à l'IA",
        instant_answers: "Réponses instantanées 24/7",
        school_system: "Système scolaire",
        success_keys: "Les clés de la réussite ici",

        // Onboarding
        complete_profile: "Complète ton profil",
        personal_info: "Informations personnelles",
        first_name: "Prénom",
        last_name: "Nom de famille",
        i_am: "Je suis...",
        newcomer_student: "Nouvel arrivant (étudiant)",
        mentor_exp: "Mentor (étudiant expérimenté)",
        bio: "Ma bio (visible par les étudiants)",
        uni_loc: "Université & Localisation",
        my_university: "Mon université",
        city: "Ville",
        preferred_lang: "Langue préférée",
        save_profile: "Sauvegarder mon profil",
        saving: "Sauvegarde en cours...",
        save_success: "Profil mis à jour !",

        // Common
        back: "Retour",
        quick_access: "Accès rapide",
        glossary_desc: "Dictionnaire des termes québécois",
        uni_desc: "Infos clés et ressources",
        msg_desc: "Tes conversations avec les mentors",
        error_saving: "Erreur lors de la sauvegarde.",
        go_to_dashboard: "Accéder à mon tableau de bord",
        discover_story: "Découvrir l'histoire du projet",
        why_this_project: "Pourquoi ce projet ?",
        what_pushed_me: "Ce qui m'a poussé à le créer",
        personal_exp: "Une expérience personnelle",
        real_problem: "Un problème réel et récurrent",
        academic_support: "Un besoin d'accompagnement académique",
        human_support: "L'importance du soutien humain",
        project_goal: "But du projet",
        aim_to_accomplish: "Ce que NouveauDépart vise à accomplir",
        global_vision: "Vision globale",
        start_adventure: "Commencer mon aventure québécoise",
        morning: "Bonjour",
        afternoon: "Bon après-midi",
        evening: "Bonsoir",
        welcome: "Bienvenue !",
    },
    en: {
        // Navbar
        dashboard: "Dashboard",
        checklist: "Checklist",
        mentors: "Mentors",
        messages: "Messages",
        ia: "AI",
        glossary: "Glossary",
        map: "Map",
        university: "University",
        profile: "Profile",
        logout: "Logout",
        student: "Student",
        mentor: "Mentor",

        // Welcome/Dashboard
        welcome_back: "Welcome back,",
        how_can_i_help: "How can I help you today?",
        discover_quebec: "Discover your new living environment and simplify your steps.",
        my_path: "My Journey",
        integration_checklist: "Integration Checklist",
        track_steps: "Track your administrative steps",
        find_mentor: "Find a Mentor",
        get_accompanied: "Get accompanied by a pro",
        ask_ia: "Ask the AI",
        instant_answers: "Instant answers 24/7",
        school_system: "School System",
        success_keys: "Keys to success here",

        // Onboarding
        complete_profile: "Complete your profile",
        personal_info: "Personal Information",
        first_name: "First Name",
        last_name: "Last Name",
        i_am: "I am...",
        newcomer_student: "Newcomer (student)",
        mentor_exp: "Mentor (experienced student)",
        bio: "My bio (visible to students)",
        uni_loc: "University & Location",
        my_university: "My university",
        city: "City",
        preferred_lang: "Preferred language",
        save_profile: "Save my profile",
        saving: "Saving...",
        save_success: "Profile updated!",

        // Common
        back: "Back",
        quick_access: "Quick Access",
        glossary_desc: "Dictionary of local terms",
        uni_desc: "Key info and resources",
        msg_desc: "Your conversations with mentors",
        error_saving: "Error while saving.",
        go_to_dashboard: "Go to my dashboard",
        discover_story: "Discover the project story",
        why_this_project: "Why this project?",
        what_pushed_me: "What pushed me to create it",
        personal_exp: "A personal experience",
        real_problem: "A real and recurring problem",
        academic_support: "A need for academic support",
        human_support: "The importance of human support",
        project_goal: "Project Goal",
        aim_to_accomplish: "What NouveauDépart aims to accomplish",
        global_vision: "Global Vision",
        start_adventure: "Start my Quebec adventure",
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening",
        welcome: "Welcome!",
    }
};

export function LanguageProvider({ children }) {
    const { user } = useAuth();
    const lang = user?.profile?.language || "fr";

    const t = useMemo(() => {
        return (key) => {
            const entries = translations[lang] || translations["fr"];
            return entries[key] || key;
        };
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ t, lang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
