import type { MetadataRoute } from "next";
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "林逍遥 AI — AI 课程与教程",
    short_name: "林逍遥 AI",
    description:
      "学习 AI 工具、Claude 使用技巧，提升日常工作效率。免费教程 + 系统视频课程。",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#c9653a",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
