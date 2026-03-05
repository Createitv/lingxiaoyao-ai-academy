import { getAllArticles, getArticleBySlug } from "@/lib/content/articles";
import { getCourses } from "@/lib/content/courses";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";
export const dynamic = "force-static";

export async function GET() {
  const [articles, courses] = await Promise.all([
    getAllArticles(),
    getCourses(),
  ]);

  const sections: string[] = [
    "# 林逍遥 AI — 完整内容",
    "",
    "> AI 课程教育平台，提供 Claude 教程、AI 使用技巧和系统视频课程。",
    "",
    `来源: ${BASE_URL}`,
    "",
    "---",
    "",
  ];

  // Course overviews (descriptions only, not paid content)
  if (courses.length > 0) {
    sections.push("# 课程");
    sections.push("");
    for (const course of courses) {
      sections.push(`## ${course.title}`);
      sections.push("");
      sections.push(`URL: ${BASE_URL}/courses/${course.slug}`);
      sections.push("");
      sections.push(course.description);
      sections.push("");
      if (course.chapters.length > 0) {
        sections.push("### 课程目录");
        sections.push("");
        for (const ch of course.chapters) {
          sections.push(`${ch.index}. ${ch.title}（${ch.duration} 分钟）`);
        }
        sections.push("");
      }
      sections.push("---");
      sections.push("");
    }
  }

  // Full article content (free articles only)
  if (articles.length > 0) {
    sections.push("# 教程文章");
    sections.push("");
    for (const article of articles) {
      const detail = await getArticleBySlug(article.slug);
      if (!detail) continue;

      sections.push(`## ${detail.title}`);
      sections.push("");
      sections.push(`URL: ${BASE_URL}/articles/${article.slug}`);
      sections.push(`发布日期: ${new Date(detail.date).toLocaleDateString("zh-CN")}`);
      if (detail.tags.length > 0) {
        sections.push(`标签: ${detail.tags.join(", ")}`);
      }
      sections.push("");
      sections.push(detail.content);
      sections.push("");
      sections.push("---");
      sections.push("");
    }
  }

  return new Response(sections.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
