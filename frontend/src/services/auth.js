import api from "./api";

export async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    sessionStorage.setItem("access_token", res.data.access);
    sessionStorage.setItem("refresh_token", res.data.refresh);
    return res.data.user;
}

export async function register(data) {
    const res = await api.post("/auth/register", data);
    sessionStorage.setItem("access_token", res.data.access);
    sessionStorage.setItem("refresh_token", res.data.refresh);
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
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    window.location.href = "/login";
}

export function isAuthenticated() {
    return Boolean(sessionStorage.getItem("access_token"));
}
