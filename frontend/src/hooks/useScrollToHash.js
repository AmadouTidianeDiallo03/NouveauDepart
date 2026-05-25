import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useScrollToHash(offset = 96) {
    const location = useLocation();

    useEffect(() => {
        if (!location.hash) return;

        const id = decodeURIComponent(location.hash.slice(1));
        const timer = window.setTimeout(() => {
            const element = document.getElementById(id);
            if (!element) return;

            const top = element.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
        }, 80);

        return () => window.clearTimeout(timer);
    }, [location.hash, offset]);
}
