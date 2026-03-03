import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Recipe Website - Discover & Share Recipes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          background: "linear-gradient(135deg, #14532d 0%, #16a34a 60%, #22c55e 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo circle */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "4px solid rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            marginBottom: 32,
          }}
        >
          🍳
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-2px",
            textAlign: "center",
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          RECIPE WEBSITE
        </div>

        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Discover & share delicious recipes from around the world
        </div>
      </div>
    ),
    { ...size }
  );
}
