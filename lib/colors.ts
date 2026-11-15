/**
 * "Field kit" highlighters: muted gear colours, each one an annotation label class.
 * Text placed on any of them uses `on` (dark) for contrast.
 */
export const labels = {
  person: { color: "#8DB0CC", name: "Person" }, // steel
  role: { color: "#E3A43A", name: "Role" }, // amber
  org: { color: "#D4C39B", name: "Organisation" }, // sand
  place: { color: "#A9B46A", name: "Place" }, // olive
  skill: { color: "#74B8AC", name: "Skill" }, // teal
} as const;

export type Label = keyof typeof labels;

export const fg = "#ECE7DC"; // bone
export const fgSoft = "#A8ADA6";
export const on = "#1A1E22"; // text on highlighter colours
export const base = "#23282D"; // gunmetal
