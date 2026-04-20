import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sarcia Rice Co.",
    short_name: "Sarcia Rice Co.",
    description:
      "Order rice online, manage deliveries, and receive account updates from Sarcia Rice Co.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f2e3",
    theme_color: "#2c441d",
    icons: [
      {
        src: "/logo/sarciariceco.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
