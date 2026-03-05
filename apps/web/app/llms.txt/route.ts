import { getAllArticles } from "@/lib/content/articles";
import { getCourses } from "@/lib/content/courses";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";
export const dynamic = "force-static";

export async function GET() {
  const [articles, courses] = await Promise.all([
    getAllArticles(),
    getCourses(),
  ]);

  const lines: string[] = [
    "# 林逍遥 AI",
    "",
    "> AI 课程教育平台，提供 Claude 教程、AI 使用技巧和系统视频课程。面向中文用户，从零基础到熟练应用。",
    "",
    `主站: ${BASE_URL}`,
    "",
  ];

  // Courses section
  if (courses.length > 0) {
    lines.push("## 课程");
    lines.push("");
    for (const course of courses) {
      const totalMinutes = course.chapters.reduce(
        (acc, ch) => acc + ch.duration,
        0,
      );
      lines.push(
        `- [${course.title}](${BASE_URL}/courses/${course.slug}): ${course.description}（${course.totalChapters} 节课，${totalMinutes} 分钟）`,
      );
    }
    lines.push("");
  }

  // Articles section
  if (articles.length > 0) {
    lines.push("## 教程文章");
    lines.push("");
    for (const article of articles) {
      const tagStr = article.tags.length > 0 ? ` [${article.tags.join(", ")}]` : "";
      lines.push(
        `- [${article.title}](${BASE_URL}/articles/${article.slug}): ${article.summary}${tagStr}`,
      );
    }
    lines.push("");
  }

  // Optional section
  lines.push("## Optional");
  lines.push("");
  lines.push(`- [关于我们](${BASE_URL}/about): 关于林逍遥 AI 平台`);
  lines.push(`- [RSS Feed](${BASE_URL}/feed.xml): 最新文章订阅`);
  lines.push(`- [完整内容](${BASE_URL}/llms-full.txt): 所有免费内容的完整 Markdown 版本`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
