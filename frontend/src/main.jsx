import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/components.css";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ErrorBoundary>
            <AuthProvider>
                <LanguageProvider>
                    <App />
                </LanguageProvider>
            </AuthProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
