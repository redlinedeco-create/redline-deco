import { ImageResponse } from "next/og";
import { CONTACT_INFO } from "@/lib/utils";

export const runtime = "edge";
export const alt = "Redline Deco — Painting and Drywalling — Sebdou, Tlemcen, Algeria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "linear-gradient(135deg, rgba(185,28,28,0.55) 0%, rgba(10,10,10,0) 55%)",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "12px",
              height: "72px",
              backgroundColor: "#B91C1C",
              display: "flex",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: "54px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              REDLINE DECO
            </div>
            <div
              style={{
                fontSize: "24px",
                color: "#FCA5A5",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginTop: "6px",
              }}
            >
              Painting and Drywalling
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
            }}
          >
            Professional Painting &amp; Drywalling
          </div>
          <div
            style={{
              fontSize: "30px",
              color: "#d4d4d4",
              marginTop: "24px",
            }}
          >
            {CONTACT_INFO.location.full}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "#B91C1C",
              color: "#ffffff",
              padding: "14px 32px",
              borderRadius: "10px",
              fontWeight: 700,
            }}
          >
            Request a Quote
          </div>
          <div
            style={{
              display: "flex",
              border: "2px solid #404040",
              color: "#ffffff",
              padding: "14px 32px",
              borderRadius: "10px",
              fontWeight: 700,
            }}
          >
            View Our Work
          </div>
        </div>
      </div>
    ),
    size
  );
}
