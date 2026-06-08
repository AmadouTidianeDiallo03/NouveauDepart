import axios from "axios";
import API_URL from "../config/api";

const API_BASE_URL = `${API_URL.replace(/\/$/, "")}/API`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const isAuthRequest = err.config?.url?.includes("/auth/login/") || err.config?.url?.includes("/auth/register/");
        if (err.response?.status === 401 && !isAuthRequest) {
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("refresh_token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default api;
