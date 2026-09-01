/**
 * Site-wide knobs. Safe for Athena to edit.
 */
export const siteConfig = {
  companyName: "NXG Life Group",
  tagline: "Turning uncertainty into certainty — because it's not just life insurance, it's assurance.",

  /**
   * Seconds to wait on the /results page (while the visitor reads the About page)
   * before Greece is triggered to call them. Change this one number to speed up or
   * slow down the delay.
   */
  callDelaySeconds: 15,
} as const;
