import api from "./api";

export async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    return res.data.user;
}

export async function register(data) {
    const res = await api.post("/auth/register", data);
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    return res.data.user;
}

export async function getMe() {
    const res = await api.get("/auth/me");
    return res.data;
}

export async function updateMe(data) {
    const res = await api.patch("/auth/me", data);
    return res.data;
}

export function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
}

export function isAuthenticated() {
    return Boolean(localStorage.getItem("access_token"));
}
