import { useEffect, useState } from "react";

// Subscribe to a CSS media query from JS. Used by the app shell to tell a real
// desktop (where the sidebar docks and can collapse) from a phone (where it
// becomes an off-canvas drawer). Tailwind's `md` breakpoint is 768px.
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
