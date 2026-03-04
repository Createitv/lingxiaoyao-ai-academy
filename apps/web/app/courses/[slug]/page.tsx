import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getCourseBySlug, getAllCourseSlugs } from "@/lib/content/courses";
import { Button } from "@workspace/ui/components/button";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllCourseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: course.coverUrl ? [course.coverUrl] : undefined,
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-muted-foreground mb-6">{course.description}</p>

          {/* Course intro MDX */}
          {course.source && (
            <div className="prose prose-zinc dark:prose-invert max-w-none mb-8">
              <MDXRemote source={course.source} />
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
                    chapter.isFree
                      ? "hover:bg-muted cursor-pointer"
                      : "opacity-70"
                  }`}
                >
                  <span className="text-sm text-muted-foreground w-6 text-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    {chapter.isFree ? (
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
            {course.coverUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  src={course.coverUrl}
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
            <Button className="w-full" size="lg" asChild>
              <Link href={`/payment?courseSlug=${slug}`}>
                {course.price === 0 ? "免费获取" : "立即购买"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
