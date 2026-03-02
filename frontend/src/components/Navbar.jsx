import { useState, useEffect } from "react";
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

    function handleLogout() {
        logout();
        navigate("/login");
    }

    // Dynamic Logic: Hide links if they are already prominent on the current page
    const isDashboard = pathname === "/dashboard";
    const allLinks = [
        { to: "/dashboard", label: t("dashboard"), icon: "🏠", always: true },
        { to: "/checklist", label: t("checklist"), icon: "✅", newcomerOnly: true, hideOnDashboard: true },
        { to: "/mentors", label: t("mentors"), icon: "🤝", newcomerOnly: true, hideOnDashboard: true },
        { to: "/conversations", label: t("messages"), icon: "💬" },
        { to: "/assistant", label: t("ia"), icon: "🤖", hideOnDashboard: true },
        { to: "/glossary", label: t("glossary"), icon: "📖", hideOnDashboard: true },
        { to: "/onboarding", label: t("profile"), icon: "🪪", hideOnDashboard: true },
    ];

    const filteredLinks = allLinks.filter(link => {
        if (link.to === pathname && link.to !== "/dashboard") return false;
        if (link.newcomerOnly && role !== "newcomer") return false;
        if (isDashboard && link.hideOnDashboard) return false;
        return true;
    });

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
                    ? "rgba(15, 23, 42, 0.75)"
                    : isMentor ? "linear-gradient(135deg, #1e1b4b, #312e81)" : "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: scrolled ? "24px" : "0",
                boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.1)",
                border: scrolled ? "1px solid rgba(255,255,255,0.1)" : "none",
                display: "flex",
                alignItems: "center",
                height: 64,
                padding: "0 1.5rem",
                transition: "all 0.4s ease",
            }}>
                {/* Brand */}
                <Link to="/dashboard" style={{
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: "1.35rem",
                    textDecoration: "none",
                    letterSpacing: "-0.04em",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}>
                    <span style={{
                        background: `linear-gradient(135deg, #fff, ${accentColor})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        NouveauDépart
                    </span>
                </Link>

                {/* Nav Links */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginLeft: "2.5rem",
                    flex: 1,
                }}>
                    {filteredLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            style={({ isActive }) => ({
                                color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                textDecoration: "none",
                                padding: "0.6rem 1rem",
                                borderRadius: "12px",
                                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                            })}
                            onMouseEnter={e => {
                                if (!e.currentTarget.style.background.includes("0.1")) {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                    e.currentTarget.style.color = "#fff";
                                }
                            }}
                            onMouseLeave={e => {
                                if (!e.currentTarget.style.background.includes("0.1")) {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                                }
                            }}
                        >
                            <span style={{ fontSize: "1.1rem" }}>{link.icon}</span>
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </div>

                {/* User Actions */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    paddingLeft: "1.25rem",
                    borderLeft: "1px solid rgba(255,255,255,0.1)",
                }}>
                    {user && (
                        <>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                lineHeight: 1.1,
                            }}>
                                <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
                                    {user.first_name}
                                </span>
                                <span style={{
                                    color: accentColor,
                                    fontSize: "0.65rem",
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}>
                                    {isMentor ? t("mentor") : t("student")}
                                </span>
                            </div>

                            <Link to="/onboarding" style={{ flexShrink: 0 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: "50%",
                                    background: avatarSrc ? "transparent" : `linear-gradient(135deg, ${accentColor}, #fff)`,
                                    border: `2px solid ${accentColor}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 900, color: isMentor ? "#1e1b4b" : "#1e3a5f", fontSize: "1rem",
                                    overflow: "hidden",
                                    boxShadow: `0 0 15px ${accentColor}44`,
                                    transition: "all 0.3s ease",
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = "scale(1.1)";
                                        e.currentTarget.style.boxShadow = `0 0 25px ${accentColor}88`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.boxShadow = `0 0 15px ${accentColor}44`;
                                    }}
                                >
                                    {avatarSrc
                                        ? <img src={avatarSrc} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : avatarLetter
                                    }
                                </div>
                            </Link>

                            <button
                                onClick={handleLogout}
                                title={t("logout")}
                                style={{
                                    background: "rgba(239, 68, 68, 0.15)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    color: "#fca5a5",
                                    borderRadius: "10px",
                                    padding: "0.5rem",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = "#ef4444";
                                    e.currentTarget.style.color = "#fff";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                                    e.currentTarget.style.color = "#fca5a5";
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
