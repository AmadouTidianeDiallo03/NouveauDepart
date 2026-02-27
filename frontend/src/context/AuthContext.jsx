import { createContext, useContext, useState, useEffect } from "react";
import { getMe, isAuthenticated as checkAuth } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(checkAuth());

    const refreshUser = async () => {
        if (checkAuth()) {
            try {
                const u = await getMe();
                setUser(u);
            } catch (err) {
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
