import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sarcia Rice Co.",
    short_name: "Sarcia Rice",
    description:
      "Order fresh rice online, manage deliveries, and keep your household staples on schedule.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fdf8ee",
    theme_color: "#4d6b35",
    categories: ["shopping", "food", "lifestyle"],
    lang: "en-PH",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
