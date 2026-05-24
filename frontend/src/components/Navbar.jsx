import { useState, useEffect, useMemo } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/auth";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar({ user }) {
    const { t } = useLanguage();
    const { pathname } = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const role = user?.profile?.role;
    const isMentor = role === "mentor";
    const accentColor = isMentor ? "#a78bfa" : "#60a5fa";
    const avatarLetter = (user?.first_name?.[0] || user?.email?.[0] || "?").toUpperCase();
    const avatarSrc = user?.profile?.avatar_url;

    const links = useMemo(() => {
        const allLinks = [
            { to: "/dashboard", label: t("dashboard"), icon: "🏠" },
            { to: "/parcours", label: "Parcours", icon: "🧭", newcomerOnly: true },
            { to: "/checklist", label: t("checklist"), icon: "✅", newcomerOnly: true },
            { to: "/university", label: t("university"), icon: "🎓" },
            { to: "/mentors", label: t("mentors"), icon: "🤝", newcomerOnly: true },
            { to: "/conversations", label: t("messages"), icon: "💬" },
            { to: "/assistant", label: t("ia"), icon: "🤖" },
            { to: "/carte", label: t("map"), icon: "📍" },
            { to: "/glossary", label: t("glossary"), icon: "📖" },
        ];
        return allLinks.filter(l => !l.newcomerOnly || !isMentor);
    }, [t, isMentor]);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <nav style={{
            position: "fixed",
            top: scrolled ? "10px" : "0px",
            left: "50%",
            transform: "translateX(-50%)",
            width: scrolled ? "95%" : "100%",
            maxWidth: "1400px",
            zIndex: 1000,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            padding: "0.5rem 0",
        }}>
            <div style={{
                background: scrolled
                    ? "rgba(15, 23, 42, 0.85)"
                    : isMentor ? "linear-gradient(135deg, #1e1b4b, #312e81)" : "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
                backdropFilter: "blur(12px)",
                borderRadius: scrolled ? "24px" : "0",
                boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.1)",
                border: scrolled ? "1px solid rgba(255,255,255,0.1)" : "none",
                display: "flex", alignItems: "center", height: 64, padding: "0 1.5rem", transition: "all 0.4s ease",
            }}>
                
                <Link to="/dashboard" style={{
                    color: "#fff", fontWeight: 900, fontSize: "1.35rem", textDecoration: "none",
                    letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: "0.5rem",
                }}>
                    <span style={{
                        background: `linear-gradient(135deg, #fff, ${accentColor})`,
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                    }}>NouveauDépart</span>
                </Link>

                
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginLeft: "2rem", flex: 1, overflowX: "auto" }}>
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            style={({ isActive }) => ({
                                color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                                fontWeight: 700, fontSize: "0.82rem", textDecoration: "none",
                                padding: "0.5rem 0.85rem", borderRadius: "10px",
                                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                display: "flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap",
                            })}
                        >
                            <span style={{ fontSize: "1.05rem" }}>{link.icon}</span>
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </div>

                
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "1rem", paddingLeft: "1rem", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.1 }}>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>{user?.first_name}</span>
                        <span style={{ color: accentColor, fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" }}>
                            {isMentor ? t("mentor") : t("student")}
                        </span>
                    </div>

                    <Link to="/onboarding">
                        <div style={{
                            width: 38, height: 38, borderRadius: "50%",
                            background: avatarSrc ? "transparent" : `linear-gradient(135deg, ${accentColor}, #fff)`,
                            border: `2px solid ${accentColor}`, display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 900, color: "#1e1b4b", overflow: "hidden", transition: "all 0.3s ease",
                        }}>
                            {avatarSrc ? <img src={avatarSrc} alt="P" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : avatarLetter}
                        </div>
                    </Link>

                    <button onClick={handleLogout} style={{
                        background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#fca5a5", borderRadius: "10px", padding: "0.5rem", cursor: "pointer", display: "flex",
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
