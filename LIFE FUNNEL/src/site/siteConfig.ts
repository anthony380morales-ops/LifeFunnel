/**
 * Site-wide knobs. Safe for Athena to edit.
 */
export const siteConfig = {
  companyName: "NXG Life Group",
  tagline: "Turning uncertainty into certainty — because it's not just life insurance, it's assurance.",

  /**
   * Brand logo. Drop your file at `public/logo.png` (or .svg) and it appears
   * automatically in the nav, hero, and footer. If the file isn't present, the
   * page gracefully falls back to the built-in gold shield mark — so the site
   * never looks broken. Set to `null` to always use the shield mark.
   */
  logoSrc: "/logo.png" as string | null,

  /**
   * Advisor headshot for the About section. Drop `public/anthony.jpg` (waist-up)
   * and it fills the portrait frame; otherwise a tasteful monogram shows.
   */
  advisorPhotoSrc: "/anthony.jpg" as string | null,

  /** The advisor. These drive the About section + footer. Edit freely. */
  advisor: {
    name: "Anthony Morales",
    title: "Life Insurance Agent",
    license: "4490102",
    region: "California",
    email: "" as string, // optional — shown in About if set
    phone: "" as string, // optional — shown in About if set
  },

  /**
   * Seconds to wait on the /results page (while the visitor reads the About page)
   * before Greece is triggered to call them. Change this one number to speed up or
   * slow down the delay.
   */
  callDelaySeconds: 15,
} as const;
