import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const timer = window.setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        window.scrollTo({ top: 0 });
      }, 60);

      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}
