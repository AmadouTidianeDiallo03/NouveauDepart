import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AppSidebar from "./components/AppSidebar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Checklist from "./pages/Checklist";
import University from "./pages/University";
import StudySuccess from "./pages/StudySuccess";
import Mentors from "./pages/Mentors";
import Conversations from "./pages/Conversations";
import Chat from "./pages/Chat";
import Assistant from "./pages/Assistant";
import Parcours from "./pages/Parcours";
import Events from "./pages/Events";
import Budget from "./pages/Budget";
import MentorAppointments from "./pages/MentorAppointments";
import AdminPanel from "./pages/AdminPanel";
import Glossary from "./pages/Glossary";
import MapExplorer from "./pages/MapExplorer";
import MentorProfile from "./pages/MentorProfile";
import NotFound from "./pages/NotFound";

import { useAuth } from "./context/AuthContext";

function Layout({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const isDashboard = location.pathname === "/dashboard";
    const isOnboarding = location.pathname === "/onboarding";
    const isWelcome = location.pathname === "/welcome";

    if (isDashboard || isOnboarding || isWelcome) return children;

    return (
        <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
            <AppSidebar user={user} collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((value) => !value)} />
            <main className="app-shell-main">{children}</main>
        </div>
    );
}

export default function App() {
    const { loading } = useAuth();

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    function Protected({ children }) {
        return (
            <ProtectedRoute>
                <Layout>{children}</Layout>
            </ProtectedRoute>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                
                <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
                <Route path="/welcome" element={<Protected><Welcome /></Protected>} />
                <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
                <Route path="/checklist" element={<Protected><Checklist /></Protected>} />
                <Route path="/university" element={<Protected><University /></Protected>} />
                <Route path="/university/:id" element={<Protected><University /></Protected>} />
                <Route path="/study-success" element={<Protected><StudySuccess /></Protected>} />
                <Route path="/mentors" element={<Protected><Mentors /></Protected>} />
                <Route path="/mentors/rendez-vous" element={<Protected><MentorAppointments /></Protected>} />
                <Route path="/mentors/:id" element={<Protected><MentorProfile /></Protected>} />
                <Route path="/conversations" element={<Protected><Conversations /></Protected>} />
                <Route path="/chat/:id" element={<Protected><Chat /></Protected>} />
                <Route path="/assistant" element={<Protected><Assistant /></Protected>} />
                <Route path="/parcours" element={<Protected><Parcours /></Protected>} />
                <Route path="/evenements" element={<Protected><Events /></Protected>} />
                <Route path="/budget" element={<Protected><Budget /></Protected>} />
                <Route path="/admin" element={<Protected><AdminRoute><AdminPanel /></AdminRoute></Protected>} />
                <Route path="/admin/:section" element={<Protected><AdminRoute><AdminPanel /></AdminRoute></Protected>} />
                <Route path="/glossary" element={<Protected><Glossary /></Protected>} />
                <Route path="/carte" element={<Protected><MapExplorer /></Protected>} />

                
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
