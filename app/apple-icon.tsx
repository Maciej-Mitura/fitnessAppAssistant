import { ImageResponse } from "next/og";

import { PWA_BACKGROUND_COLOR } from "@/lib/pwa/config";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
          background: PWA_BACKGROUND_COLOR,
          borderRadius: 36,
        }}
      >
        <svg
          width="88"
          height="88"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#34d399"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <div
          style={{
            marginTop: 12,
            color: "#e2e8f0",
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          FitOS
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
