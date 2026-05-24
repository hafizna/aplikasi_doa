import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Munajat - Pemandu Dzikir & Doa",
    short_name: "Munajat",
    description: "PWA offline-first untuk dzikir setelah sholat dan doa ma'tsur.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f3e8",
    theme_color: "#17443f",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
