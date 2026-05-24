import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { logout } from "../services/auth";
import "../styles/app-shell.css";

const NAV_GROUPS = [
    {
        title: "Principal",
        items: [
            { to: "/dashboard", label: "Tableau de bord", icon: "home", roles: ["student", "mentor", "admin"] },
            { to: "/parcours", label: "Parcours", icon: "compass", roles: ["student", "admin"] },
            { to: "/checklist", label: "Checklist", icon: "check", roles: ["student", "admin"] },
        ],
    },
    {
        title: "Accompagnement",
        items: [
            { to: "/mentors", label: "Mentors", icon: "users", roles: ["student", "admin"] },
            { to: "/conversations", label: "Messages", icon: "mail", roles: ["student", "mentor", "admin"] },
            { to: "/mentors/rendez-vous", label: "Rendez-vous", icon: "calendar", roles: ["student", "mentor", "admin"] },
            { to: "/dashboard", label: "Étudiants accompagnés", icon: "users", roles: ["mentor"] },
            { to: "/evenements", label: "Événements", icon: "calendar", roles: ["student", "mentor", "admin"] },
        ],
    },
    {
        title: "Outils étudiants",
        items: [
            { to: "/budget", label: "Budget", icon: "wallet", roles: ["student", "admin"] },
            { to: "/assistant", label: "IA", icon: "bot", roles: ["student", "admin"] },
            { to: "/carte", label: "Carte", icon: "pin", roles: ["student", "admin"] },
        ],
    },
    {
        title: "Ressources",
        items: [
            { to: "/university", label: "Université", icon: "school", roles: ["student", "admin"] },
            { to: "/study-success", label: "Guides", icon: "book", roles: ["student", "admin"] },
            { to: "/glossary", label: "Glossaire", icon: "book", roles: ["student", "admin"] },
            { to: "/study-success", label: "Ressources", icon: "book", roles: ["mentor"] },
        ],
    },
    {
        title: "Administration",
        items: [
            { to: "/admin", label: "Admin", icon: "shield", roles: ["admin"] },
        ],
    },
];

function getRole(user) {
    if (user?.role === "admin" || user?.is_staff || user?.is_superuser) return "admin";
    return user?.role || user?.profile?.role || "student";
}

export default function AppSidebar({ user, collapsed = false, onToggleCollapsed }) {
    const [open, setOpen] = useState(false);
    const role = getRole(user);
    const groups = NAV_GROUPS
        .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role)) }))
        .filter((group) => group.items.length > 0);

    return (
        <>
            <button className="app-sidebar-toggle mobile-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Ouvrir le menu">
                <span />
                <span />
                <span />
            </button>

            <aside className={`app-sidebar ${open ? "open" : ""} ${collapsed ? "compact" : ""}`}>
                <div className="app-sidebar-head">
                    <Link to="/dashboard" className="app-sidebar-logo" onClick={() => setOpen(false)} title="NouveauDépart">
                        <span><Icon name="school" /></span>
                        <strong>NouveauDépart</strong>
                    </Link>
                    <button className="app-sidebar-collapse" type="button" onClick={onToggleCollapsed} aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"} title={collapsed ? "Agrandir le menu" : "Réduire le menu"}>
                        <Icon name="menu" />
                    </button>
                </div>

                <nav className="app-sidebar-nav">
                    {groups.map((group) => (
                        <div className="app-sidebar-group" key={group.title}>
                            <div className="app-sidebar-group-title">{group.title}</div>
                            {group.items.map((item) => (
                                <NavLink
                                    key={`${group.title}-${item.label}`}
                                    to={item.to}
                                    title={item.label}
                                    onClick={() => setOpen(false)}
                                    className={({ isActive }) => `app-sidebar-link ${isActive ? "active" : ""}`}
                                >
                                    <Icon name={item.icon} />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <button className="app-sidebar-logout" type="button" onClick={logout} title="Déconnexion">
                    <Icon name="logout" />
                    <span>Déconnexion</span>
                </button>
            </aside>

            {open && <button className="app-sidebar-backdrop" type="button" aria-label="Fermer le menu" onClick={() => setOpen(false)} />}
        </>
    );
}

function Icon({ name }) {
    const paths = {
        home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3v-10.5Z",
        compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2.1 5-5 2.1 2.1-5 5-2.1Z",
        check: "M20 6 9 17l-5-5",
        school: "M3 8.5 12 4l9 4.5-9 4.5L3 8.5Zm4 3.5v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V12",
        users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
        mail: "M4 5h16v14H4V5Zm0 2 8 6 8-6",
        bot: "M12 8V4m0 4h5a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3h5Zm-4 5h.01M16 13h.01M9 17h6",
        pin: "M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
        book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Zm0 0V21",
        calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
        wallet: "M3 7h18v12H3V7Zm3-4h12v4H6V3Zm12 10h.01",
        logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9",
        shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
        menu: "M4 6h16M4 12h16M4 18h16",
    };

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={paths[name] || paths.home} />
        </svg>
    );
}
