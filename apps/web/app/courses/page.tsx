import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCourses } from "@/lib/content/courses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "视频课程",
  description: "系统学习 AI 工具，从零基础到熟练应用，视频课程一站搞定。",
};

const defaultCovers: Record<string, string> = {
  "claude-for-everyone": "/courses/claude-for-everyone.svg",
  "claude-api-development": "/courses/claude-api-development.svg",
  "claude-api": "/courses/claude-api-development.svg",
};

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">视频课程</h1>
      <p className="text-muted-foreground mb-10">
        系统学习，效率加倍。视频 + 图文，随时随地学。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => {
          const coverSrc =
            course.coverUrl || defaultCovers[course.slug];

          return (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className="group flex flex-col border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {coverSrc ? (
                <div className="aspect-video bg-muted overflow-hidden relative">
                  <Image
                    src={coverSrc}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-4xl">🎓</span>
                </div>
              )}
              <div className="flex flex-col flex-1 p-5">
                <h2 className="font-bold text-lg group-hover:text-primary transition-colors">
                  {course.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground flex-1 line-clamp-3">
                  {course.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {course.totalChapters} 节 · 视频课程
                  </div>
                  <div className="font-bold text-lg">
                    {course.price === 0 ? (
                      <span className="text-green-600">免费</span>
                    ) : (
                      <span>¥{(course.price / 100).toFixed(0)}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
