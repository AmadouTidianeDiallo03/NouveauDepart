import axios from "axios";

const api = axios.create({
    baseURL: "/api",
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
