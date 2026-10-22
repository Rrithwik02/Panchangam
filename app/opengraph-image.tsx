import { ImageResponse } from "next/og";

export const alt = "Panchangam – Today's Tithi, Nakshatra and Rahu Kalam";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d13",
          color: "#faf8f5",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 120,
            height: 120,
            borderRadius: 32,
            background: "#d97706",
            marginBottom: 40,
          }}
        />
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>Panchangam</div>
        <div style={{ display: "flex", fontSize: 38, color: "#d6d3cd", marginTop: 20 }}>
          Today&apos;s Tithi, Nakshatra, Rahu Kalam &amp; timings
        </div>
      </div>
    ),
    { ...size }
  );
}
