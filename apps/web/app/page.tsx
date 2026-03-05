import { getLatestArticles } from "@/lib/content/articles";
import { getCourses } from "@/lib/content/courses";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CoursesSection } from "@/components/landing/courses-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { ArticlesSection } from "@/components/landing/articles-section";
import { InstructorSection } from "@/components/landing/instructor-section";
import { CTASection } from "@/components/landing/cta-section";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";

export default async function HomePage() {
  const latestArticles = await getLatestArticles(3);
  const courses = await getCourses();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "林逍遥 AI",
      url: BASE_URL,
      description:
        "学习 AI 工具、Claude 使用技巧，提升日常工作效率。免费教程 + 系统视频课程。",
      potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "林逍遥 AI",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      description:
        "AI 课程教育平台，提供 Claude 教程、AI 使用技巧和系统视频课程。",
    },
  ];

  const serializedArticles = latestArticles.map((a) => ({
    slug: a.slug,
    title: a.title,
    date: typeof a.date === "string" ? a.date : new Date(a.date).toISOString(),
    tags: a.tags,
    summary: a.summary,
    readingTime: a.readingTime,
  }));

  const serializedCourses = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    description: c.description,
    price: c.price,
    coverUrl: c.coverUrl ?? null,
    totalChapters: c.totalChapters,
    chapters: c.chapters.map((ch) => ({ duration: ch.duration })),
  }));

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 1. Hero: 权威宣言 + 个人品牌卡片 + 内联社会证据 */}
      <HeroSection />
      {/* 2. 学习路径: 入门 / 进阶 / 企业 三条路径 */}
      <FeaturesSection />
      {/* 3. 课程目录: 带难度标签的课程卡片 */}
      <CoursesSection courses={serializedCourses} />
      {/* 4. 学员评价: 三列证言卡片 */}
      <SocialProofSection />
      {/* 5. 最新教程: 卡片式文章展示 */}
      <ArticlesSection articles={serializedArticles} />
      {/* 6. 关于讲师: 嵌入式个人品牌卡片 */}
      <InstructorSection />
      {/* 7. 底部 CTA */}
      <CTASection />
    </main>
  );
}
