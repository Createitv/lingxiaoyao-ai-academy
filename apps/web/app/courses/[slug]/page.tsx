import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCourseBySlug, getAllCourseSlugs } from "@/lib/content/courses";
import { getCurrentUser } from "@/lib/auth/session";
import { hasCoursePurchased } from "@/lib/db/user-courses";
import { Button } from "@workspace/ui/components/button";
import { MdxRenderer } from "@/components/mdx/mdx-renderer";



const defaultCovers: Record<string, string> = {
  "claude-for-everyone": "/courses/claude-for-everyone.svg",
  "claude-api-development": "/courses/claude-api-development.svg",
  "claude-api": "/courses/claude-api-development.svg",
  "ai-enterprise-custom": "/courses/ai-enterprise-custom.svg",
};

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllCourseSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}
export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";
  const courseUrl = `${BASE_URL}/courses/${slug}`;
  const totalDuration = course.chapters.reduce((acc, ch) => acc + ch.duration, 0);

  return {
    title: course.title,
    description: course.description,
    keywords: [course.title, "AI课程", "Claude", "在线课程", "视频教程", "人工智能"],
    alternates: { canonical: courseUrl },
    openGraph: {
      title: course.title,
      description: course.description,
      type: "website",
      url: courseUrl,
      locale: "zh_CN",
      siteName: "林逍遥 AI",
      images: course.coverUrl ? [course.coverUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: `${course.description} | ${course.totalChapters}节课 · ${totalDuration}分钟`,
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const coverSrc = course.coverUrl || defaultCovers[slug];
  const user = await getCurrentUser();
  const purchased = user ? await hasCoursePurchased(user.id, course.id) : false;

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: "林逍遥 AI",
      url: BASE_URL,
    },
    url: `${BASE_URL}/courses/${slug}`,
    image: course.coverUrl,
    offers: {
      "@type": "Offer",
      price: (course.price / 100).toFixed(2),
      priceCurrency: "CNY",
      availability: "https://schema.org/InStock",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: `PT${course.chapters.reduce((acc, ch) => acc + ch.duration, 0)}M`,
    },
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-muted-foreground mb-6">{course.description}</p>

          {/* Course intro MDX */}
          {course.content && (
            <div className="prose dark:prose-invert max-w-none mb-8">
              <MdxRenderer source={course.content} />
            </div>
          )}

          {/* Chapters List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">课程目录</h2>
            <div className="space-y-2">
              {course.chapters.map((chapter, idx) => (
                <div
                  key={chapter.index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    chapter.isFree || purchased
                      ? "hover:bg-muted cursor-pointer"
                      : "opacity-70"
                  }`}
                >
                  <span className="text-sm text-muted-foreground w-6 text-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    {chapter.isFree || purchased ? (
                      <Link
                        href={`/courses/${slug}/${chapter.index}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {chapter.title}
                      </Link>
                    ) : (
                      <span className="font-medium">{chapter.title}</span>
                    )}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {chapter.duration} 分钟
                    </div>
                  </div>
                  <div className="text-xs">
                    {chapter.isFree ? (
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        免费
                      </span>
                    ) : purchased ? (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        已解锁
                      </span>
                    ) : (
                      <span className="text-muted-foreground">🔒</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Purchase card */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 border rounded-xl p-6 space-y-4">
            {coverSrc && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  src={coverSrc}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority
                />
              </div>
            )}
            <div className="text-3xl font-bold">
              {course.price === 0 ? (
                <span className="text-green-600">免费</span>
              ) : (
                `¥${(course.price / 100).toFixed(0)}`
              )}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>✅ {course.totalChapters} 节视频课程</div>
              <div>✅ 配套图文教程</div>
              <div>✅ 永久有效</div>
            </div>
            {purchased ? (
              <>
                <div className="px-3 py-2 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-center text-sm font-medium">
                  已购买
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/courses/${slug}/${course.chapters[0]?.index ?? 1}`}>
                    开始学习
                  </Link>
                </Button>
              </>
            ) : (
              <Button className="w-full" size="lg" asChild>
                <Link href={`/payment/confirm?courseSlug=${slug}`}>
                  {course.price === 0 ? "免费获取" : "立即购买"}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
