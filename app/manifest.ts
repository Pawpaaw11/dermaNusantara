import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Derma Nusantara", short_name: "Derma Nusantara", description: "Platform donasi dan gerakan kebaikan transparan di Indonesia.", start_url: "/", display: "standalone", background_color: "#faf9f6", theme_color: "#1a237e", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }] };
}
