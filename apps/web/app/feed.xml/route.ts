import { getLatestArticles } from "@/lib/content/articles";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "lingxiaoyao";

export async function GET() {
  const articles = await getLatestArticles(20);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} — AI 课程与教程</title>
    <link>${BASE_URL}</link>
    <description>学习 AI 工具、Claude 使用技巧，提升日常工作效率。</description>
    <language>zh-CN</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${articles
      .map(
        (article) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${BASE_URL}/articles/${article.slug}</link>
      <guid>${BASE_URL}/articles/${article.slug}</guid>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <description><![CDATA[${article.summary}]]></description>
    </item>`,
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
