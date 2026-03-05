import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/content/articles";

export const runtime = "nodejs";
export const alt = "文章";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ArticleOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const title = article?.title ?? "文章";
  const tags = article?.tags ?? [];
  const series = article?.series;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #080c14 0%, #0e1420 50%, #141c2e 100%)",
          fontFamily: "sans-serif",
          padding: "60px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Gradient glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(ellipse at 25% 30%, rgba(0,212,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 75% 70%, rgba(124,58,237,0.08) 0%, transparent 60%)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          {/* Series badge */}
          {series && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: "#00d4ff",
                  background: "rgba(0,212,255,0.08)",
                  border: "1px solid rgba(0,212,255,0.25)",
                  padding: "6px 18px",
                  borderRadius: 100,
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                }}
              >
                {series.toUpperCase()}
              </div>
            </div>
          )}
          {/* Tags */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {tags.slice(0, 3).map((tag) => (
              <div
                key={tag}
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  background: "rgba(255,255,255,0.05)",
                  padding: "4px 14px",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          {/* Title */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              maxWidth: 900,
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 600, color: "#e2e8f0" }}>
            林逍遥 AI
          </div>
          <div style={{ fontSize: 16, color: "#64748b", fontFamily: "monospace" }}>
            lingxiaoyao.cn
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
