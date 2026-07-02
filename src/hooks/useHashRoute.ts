import { useEffect, useState } from "react";

/**
 * Reads window.location.hash and re-renders on the `hashchange` event.
 *
 * Hand-rolled hash routing (no routing library) — see
 * docs/superpowers/specs/2026-07-02-admin-editor-turni-design.md sez. 4.
 *
 * Returns the normalized current route, e.g. `"/"` for empty/`#`/`#/`,
 * or `"/admin"` for `#/admin`.
 */
function normalizeHash(hash: string): string {
  // Strip the leading '#'
  let route = hash.startsWith("#") ? hash.slice(1) : hash;
  // Empty hash -> root
  if (route === "") return "/";
  // Ensure leading slash
  if (!route.startsWith("/")) route = `/${route}`;
  return route;
}

function getCurrentRoute(): string {
  if (typeof window === "undefined") return "/";
  return normalizeHash(window.location.hash);
}

export function useHashRoute(): string {
  const [route, setRoute] = useState<string>(getCurrentRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getCurrentRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

export default useHashRoute;
