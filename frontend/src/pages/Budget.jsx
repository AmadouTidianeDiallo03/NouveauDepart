import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const fields = [
    ["housing", "Loyer"],
    ["transport", "Transport"],
    ["food", "Alimentation"],
    ["phone", "Téléphone"],
    ["insurance", "Assurances"],
    ["tuition", "Frais universitaires"],
    ["leisure", "Loisirs"],
    ["other", "Autres dépenses"],
];

export default function Budget() {
    const [form, setForm] = useState(Object.fromEntries(fields.map(([key]) => [key, "0"])));
    const [saved, setSaved] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/budget/").then((res) => {
            const data = res.data?.budget === null ? null : res.data;
            if (data?.id) {
                setSaved(data);
                setForm(Object.fromEntries(fields.map(([key]) => [key, String(data[key] || 0)])));
            }
        }).finally(() => setLoading(false));
    }, []);

    const total = useMemo(() => fields.reduce((sum, [key]) => sum + Number(form[key] || 0), 0), [form]);
    const largest = useMemo(() => fields.map(([key, label]) => ({ label, amount: Number(form[key] || 0) })).sort((a, b) => b.amount - a.amount)[0], [form]);

    async function saveBudget(e) {
        e.preventDefault();
        const res = await api.post("/budget/", form);
        setSaved(res.data);
    }

    return (
        <div className="page-content" style={{ background: "#f6f8fc", minHeight: "100vh" }}>
            <div className="container-lg">
                <section style={heroStyle}>
                    <h1>Budget étudiant</h1>
                    <p>Estime ton budget mensuel au Québec et identifie tes principales dépenses.</p>
                </section>
                {loading ? <p>Chargement...</p> : (
                    <div style={layoutStyle}>
                        <form onSubmit={saveBudget} style={cardStyle}>
                            <h2>Mes dépenses mensuelles</h2>
                            <div style={formGridStyle}>
                                {fields.map(([key, label]) => (
                                    <label key={key} style={{ display: "grid", gap: ".35rem", color: "#334155", fontWeight: 800 }}>
                                        {label}
                                        <input type="number" min="0" step="0.01" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                                    </label>
                                ))}
                            </div>
                            <button style={buttonStyle}>Enregistrer mon budget</button>
                        </form>
                        <aside style={cardStyle}>
                            <h2>Résumé</h2>
                            <div style={amountStyle}>{total.toFixed(0)} $</div>
                            <p>Budget mensuel estimé</p>
                            <p><strong>Total annuel :</strong> {(total * 12).toFixed(0)} $</p>
                            <p><strong>Dépense principale :</strong> {largest?.label || "Aucune"}</p>
                            <div style={adviceStyle}>
                                {saved?.advice || "Conseil : garde une marge pour les imprévus des premières semaines."}
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}

const heroStyle = { background: "linear-gradient(135deg,#07152e,#1d4ed8)", color: "#fff", borderRadius: 24, padding: "2rem", marginBottom: "1rem" };
const layoutStyle = { display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(280px,.6fr)", gap: "1rem" };
const cardStyle = { background: "#fff", border: "1px solid #dbe5f4", borderRadius: 18, padding: "1.25rem", boxShadow: "0 18px 45px rgba(15,23,42,.07)" };
const formGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "1rem" };
const inputStyle = { border: "1px solid #dbe5f4", borderRadius: 12, padding: ".8rem", font: "inherit" };
const buttonStyle = { marginTop: "1rem", border: 0, borderRadius: 12, background: "#1d4ed8", color: "#fff", padding: ".8rem 1.1rem", fontWeight: 850, cursor: "pointer" };
const amountStyle = { fontSize: "3rem", fontWeight: 950, color: "#1d4ed8" };
const adviceStyle = { background: "#eff6ff", color: "#1e3a8a", borderRadius: 14, padding: "1rem", lineHeight: 1.5, fontWeight: 700 };
