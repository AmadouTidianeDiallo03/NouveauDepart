import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function Navbar({ user }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const role = user?.profile?.role;
    const isMentor = role === "mentor";
    const avatarLetter = (user?.first_name?.[0] || user?.email?.[0] || "?").toUpperCase();
    const avatarSrc = user?.profile?.avatar_url;

    function handleLogout() {
        logout();
        navigate("/login");
    }

    const accentColor = isMentor ? "#818cf8" : "#60a5fa";

    return (
        <nav
            role="navigation"
            aria-label="Navigation principale"
            style={{
                background: isMentor
                    ? "linear-gradient(135deg, #1e1b4b, #312e81)"
                    : "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
                position: "sticky", top: 0, zIndex: 100,
            }}
        >
            <div className="container" style={{
                display: "flex", alignItems: "center",
                height: 60, gap: "1.5rem",
            }}>
                {/* Brand */}
                <Link to="/dashboard" style={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    textDecoration: "none",
                    letterSpacing: "-0.02em",
                    flexShrink: 0,
                }}>
                    Nouveau<span style={{ color: accentColor }}>Départ</span>
                </Link>

                {/* Role badge */}
                {user && (
                    <span style={{
                        background: "rgba(255,255,255,0.12)",
                        color: accentColor,
                        borderRadius: "999px",
                        padding: "0.15rem 0.7rem",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        flexShrink: 0,
                    }}>
                        {isMentor ? "⭐ Mentor" : "🌟 Étudiant"}
                    </span>
                )}

                {/* Desktop links */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginLeft: "auto", flexWrap: "wrap" }}>
                    {[
                        { to: "/dashboard", label: "Tableau de bord" },
                        ...(role === "newcomer" ? [
                            { to: "/checklist", label: "Checklist" },
                            { to: "/mentors", label: "Mentors" },
                        ] : []),
                        { to: "/conversations", label: "Messages" },
                        { to: "/assistant", label: "IA" },
                        { to: "/glossary", label: "Glossaire" },
                        ...(user?.profile?.university ? [{ to: `/university/${user.profile.university.id}`, label: "Université" }] : []),
                        { to: "/onboarding", label: "Profil" },
                    ].map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            style={({ isActive }) => ({
                                color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                                fontWeight: isActive ? 700 : 500,
                                fontSize: "0.88rem",
                                textDecoration: "none",
                                padding: "0.35rem 0.65rem",
                                borderRadius: "8px",
                                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                                transition: "all 0.15s",
                            })}
                            onMouseEnter={e => { if (!e.currentTarget.style.background.includes("0.12")) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                            onMouseLeave={e => { if (!e.currentTarget.style.background.includes("0.12")) e.currentTarget.style.background = "transparent"; }}
                        >
                            {label}
                        </NavLink>
                    ))}

                    {/* Avatar + logout */}
                    {user && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.5rem", paddingLeft: "0.75rem", borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
                            <Link to="/onboarding" title="Mon profil" style={{ flexShrink: 0 }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: "50%",
                                    background: avatarSrc ? "transparent" : "rgba(255,255,255,0.2)",
                                    border: "2px solid rgba(255,255,255,0.4)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 800, color: "#fff", fontSize: "0.9rem",
                                    overflow: "hidden",
                                    transition: "border-color 0.2s",
                                }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = accentColor}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"}
                                >
                                    {avatarSrc
                                        ? <img src={avatarSrc} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : avatarLetter
                                    }
                                </div>
                            </Link>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: "rgba(255,255,255,0.08)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    color: "rgba(255,255,255,0.75)",
                                    borderRadius: "8px",
                                    padding: "0.3rem 0.7rem",
                                    fontSize: "0.8rem",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                            >
                                Déconnexion
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
