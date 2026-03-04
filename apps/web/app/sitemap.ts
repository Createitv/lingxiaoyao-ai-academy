import { MetadataRoute } from "next";
import { getAllArticleSlugs } from "@/lib/content/articles";
import { getAllDocSlugs } from "@/lib/content/docs";
import { getCourses } from "@/lib/content/courses";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articleSlugs, docSlugs, courses] = await Promise.all([
    getAllArticleSlugs(),
    getAllDocSlugs(),
    getCourses(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/docs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${BASE_URL}/articles/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const docRoutes: MetadataRoute.Sitemap = docSlugs.map((slugParts) => ({
    url: `${BASE_URL}/docs/${slugParts.join("/")}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${BASE_URL}/courses/${course.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...articleRoutes,
    ...docRoutes,
    ...courseRoutes,
  ];
}
