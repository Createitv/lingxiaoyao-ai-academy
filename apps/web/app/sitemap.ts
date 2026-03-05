import { MetadataRoute } from "next";
import { getAllArticleSlugsWithDates, getAllSeries } from "@/lib/content/articles";
import { getCourses } from "@/lib/content/courses";

// Revalidate sitemap every hour so new articles appear promptly
export const revalidate = 3600;

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, courses, seriesList] = await Promise.all([
    getAllArticleSlugsWithDates(),
    getCourses(),
    getAllSeries(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Series-filtered article listing pages
  const seriesRoutes: MetadataRoute.Sitemap = seriesList.map((s) => ({
    url: `${BASE_URL}/articles?series=${encodeURIComponent(s)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${BASE_URL}/courses/${course.slug}`,
    lastModified: course.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Chapter routes for each course
  const chapterRoutes: MetadataRoute.Sitemap = courses.flatMap((course) =>
    course.chapters.map((ch) => ({
      url: `${BASE_URL}/courses/${course.slug}/${ch.index}`,
      lastModified: course.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [
    ...staticRoutes,
    ...seriesRoutes,
    ...articleRoutes,
    ...courseRoutes,
    ...chapterRoutes,
  ];
}
