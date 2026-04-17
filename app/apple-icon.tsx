import { ImageResponse } from "next/og";

export const contentType = "image/png";

export const size = {
  width: 180,
  height: 180,
};

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #2c441d 0%, #4d6b35 55%, #7b9656 100%)",
          color: "#f6ebcf",
          fontSize: 74,
          fontWeight: 800,
          borderRadius: 36,
          letterSpacing: "-0.06em",
        }}
      >
        SR
      </div>
    ),
    size
  );
}
