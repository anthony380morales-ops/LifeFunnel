import { useEffect } from "react";

// Mark the document as reveal-capable as soon as this module loads (app boot,
// well before /results paints). CSS only hides `.nxg-reveal` under this class,
// so if JS never runs the content stays fully visible instead of blank.
if (typeof document !== "undefined") {
  document.documentElement.classList.add("nxg-js");
}

/**
 * Reveals elements as they scroll into view — the modern "award-winning"
 * section-entrance feel, with zero third-party weight (native IntersectionObserver).
 *
 * Usage: give any element the class `nxg-reveal` (optionally `nxg-reveal--l`
 * / `nxg-reveal--r` for a directional slide, and inline `--i` for stagger).
 * Mount this hook once on the page; it watches every `.nxg-reveal` and adds
 * `is-in` as each crosses the threshold. Honors prefers-reduced-motion by
 * revealing everything immediately.
 */
export function useScrollReveal() {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".nxg-reveal"),
    );
    if (nodes.length === 0) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target); // reveal once, then stop watching
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}
