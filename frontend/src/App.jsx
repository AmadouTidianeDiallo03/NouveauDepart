import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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
import Glossary from "./pages/Glossary";
import MapExplorer from "./pages/MapExplorer";
import NotFound from "./pages/NotFound";

import { useAuth } from "./context/AuthContext";

function Layout({ children }) {
    const { user } = useAuth();
    return (
        <>
            <Navbar user={user} />
            <main>{children}</main>
            <Footer />
        </>
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
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Protected */}
                <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
                <Route path="/welcome" element={<Protected><Welcome /></Protected>} />
                <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
                <Route path="/checklist" element={<Protected><Checklist /></Protected>} />
                <Route path="/university/:id" element={<Protected><University /></Protected>} />
                <Route path="/study-success" element={<Protected><StudySuccess /></Protected>} />
                <Route path="/mentors" element={<Protected><Mentors /></Protected>} />
                <Route path="/conversations" element={<Protected><Conversations /></Protected>} />
                <Route path="/chat/:id" element={<Protected><Chat /></Protected>} />
                <Route path="/assistant" element={<Protected><Assistant /></Protected>} />
                <Route path="/glossary" element={<Protected><Glossary /></Protected>} />
                <Route path="/carte" element={<Protected><MapExplorer /></Protected>} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
