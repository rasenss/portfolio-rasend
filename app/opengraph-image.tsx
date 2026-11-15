import { ImageResponse } from "next/og";

export const alt = "Rasendriya Khansa Jolankarfyan, AI data annotator and front-end developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 96px", background: "#23282D", color: "#ECE7DC", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", position: "relative", alignSelf: "flex-start", padding: "8px 24px", border: "4px dashed #ECE7DC", borderRadius: 28, background: "rgba(141,176,204,0.12)" }}>
          <div style={{ position: "absolute", top: -54, left: -4, display: "flex", background: "#8DB0CC", color: "#1A1E22", fontSize: 26, fontWeight: 700, padding: "6px 18px", borderRadius: 999 }}>person 0.99</div>
          <span style={{ fontSize: 132, fontWeight: 900, letterSpacing: -4, textTransform: "uppercase" }}>Rasendriya</span>
        </div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 38, gap: 14, alignItems: "center" }}>
          <span style={{ background: "#E3A43A", color: "#1A1E22", padding: "4px 14px", borderRadius: 12 }}>AI data annotator</span>
          <span>and</span>
          <span style={{ background: "#74B8AC", color: "#1A1E22", padding: "4px 14px", borderRadius: 12 }}>front-end developer</span>
        </div>
      </div>
    ),
    size,
  );
}
