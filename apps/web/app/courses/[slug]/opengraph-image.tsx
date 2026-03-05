import { ImageResponse } from "next/og";
import { getCourseBySlug } from "@/lib/content/courses";

export const runtime = "nodejs";
export const alt = "课程";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function CourseOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  const title = course?.title ?? "课程";
  const description = course?.description ?? "";
  const totalChapters = course?.totalChapters ?? 0;
  const price = course?.price ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #faf5f0 0%, #f5ebe0 50%, #faf5f0 100%)",
          fontFamily: "sans-serif",
          padding: "60px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 16,
              color: "#c9653a",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 20,
            }}
          >
            Video Course
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#1a1a1a",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              maxWidth: 900,
              marginBottom: 20,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#666",
              lineHeight: 1.5,
              maxWidth: 700,
            }}
          >
            {description.length > 100
              ? description.slice(0, 100) + "..."
              : description}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#1a1a1a" }}>
              林逍遥 AI
            </div>
            <div
              style={{
                fontSize: 16,
                color: "#666",
                background: "rgba(0,0,0,0.05)",
                padding: "6px 16px",
                borderRadius: 20,
              }}
            >
              {totalChapters} 节课
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#c9653a",
              }}
            >
              {price === 0 ? "免费" : `¥${(price / 100).toFixed(0)}`}
            </div>
          </div>
          <div style={{ fontSize: 18, color: "#999" }}>lingxiaoyao.cn</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
