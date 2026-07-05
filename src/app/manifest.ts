import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HTGo Money",
    short_name: "HTGo",
    description: "Ứng dụng giúp bạn dễ dàng theo dõi thu nhập, chi tiêu và phân tích tài chính cá nhân một cách trực quan, bảo mật.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#5346ec",
    icons: [
      {
        src: "/images/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
