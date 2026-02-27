import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function MentorCard({ mentor }) {
    const navigate = useNavigate();
    const initials = mentor.full_name
        ? mentor.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "M";

    async function handleContact() {
        try {
            const res = await api.post("/chat/conversations/", { mentor_id: mentor.id });
            navigate(`/chat/${res.data.id}`);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="mentor-card">
            <div className="mentor-card__header">
                <div className="mentor-card__avatar" aria-hidden="true">{initials}</div>
                <div>
                    <div className="mentor-card__name">{mentor.full_name}</div>
                    <div className="mentor-card__meta">
                        {mentor.university?.name || "—"} · {mentor.city || "—"}
                    </div>
                </div>
                <span
                    className={`badge badge-${mentor.language === "fr" ? "primary" : "warning"}`}
                    style={{ marginLeft: "auto" }}
                >
                    {mentor.language === "fr" ? "FR" : "EN"}
                </span>
            </div>
            {mentor.bio && <p className="mentor-card__bio">{mentor.bio}</p>}
            <button className="btn btn-outline btn-sm" onClick={handleContact}>
                Contacter
            </button>
        </div>
    );
}
