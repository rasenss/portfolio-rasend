import { ImageResponse } from "next/og";

/* The picture shown when the site's link is shared (LinkedIn, WhatsApp, X, Slack…):
   the name inside the site's dashed "detected person" box, with the two roles as labels. */

export const alt = "Rasendriya Khansa Jolankarfyan, AI data annotator and UI/UX designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const base = "#23282D";
const fg = "#ECE7DC";
const on = "#1A1E22";
const amber = "#E3A43A";
const steel = "#8DB0CC";
const teal = "#74B8AC";
const sand = "#D4C39B";

const handle = (pos: Record<string, number>) => (
  <div style={{ position: "absolute", width: 18, height: 18, borderRadius: 5, border: `4px solid ${fg}`, background: base, ...pos }} />
);

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", background: base, color: fg }}>
        <div style={{ display: "flex", position: "relative", flexDirection: "column", alignSelf: "flex-start", padding: "26px 40px 30px", border: `4px dashed ${fg}`, borderRadius: 30, background: "rgba(141,176,204,0.10)" }}>
          <div style={{ position: "absolute", top: -58, left: -4, display: "flex", background: steel, color: on, fontSize: 28, fontWeight: 700, padding: "6px 20px", borderRadius: 999 }}>person 1.00</div>
          {handle({ top: -11, left: -11 })}
          {handle({ top: -11, right: -11 })}
          {handle({ bottom: -11, left: -11 })}
          {handle({ bottom: -11, right: -11 })}
          <span style={{ fontSize: 92, fontWeight: 900, letterSpacing: -3, lineHeight: 1, textTransform: "uppercase" }}>Rasendriya Khansa</span>
          <span style={{ fontSize: 92, fontWeight: 900, letterSpacing: -3, lineHeight: 1, marginTop: 8, textTransform: "uppercase", color: amber }}>Jolankarfyan</span>
        </div>
        <div style={{ display: "flex", marginTop: 52, fontSize: 34, gap: 16, alignItems: "center" }}>
          <span style={{ background: amber, color: on, padding: "6px 18px", borderRadius: 12 }}>AI data annotator</span>
          <span style={{ background: teal, color: on, padding: "6px 18px", borderRadius: 12 }}>UI/UX designer</span>
          <span style={{ background: sand, color: on, padding: "6px 18px", borderRadius: 12 }}>Computer Science</span>
        </div>
      </div>
    ),
    size,
  );
}
