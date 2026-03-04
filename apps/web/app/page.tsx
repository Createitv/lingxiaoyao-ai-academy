import Link from "next/link";
import Image from "next/image";
import { Button } from "@workspace/ui/components/button";
import { getLatestArticles } from "@/lib/content/articles";
import { getCourses } from "@/lib/content/courses";

export default async function HomePage() {
  const latestArticles = await getLatestArticles(3);
  const courses = await getCourses();

  return (
    <main>
      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          用 AI，做更好的自己
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          系统学习 Claude 和 AI 工具，提升工作效率。
          从零基础到熟练应用，视频课程 + 图文教程，一站搞定。
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/courses">浏览课程</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/articles">免费教程</Link>
          </Button>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">精选课程</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className="group block border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {course.coverUrl && (
                <div className="aspect-video bg-muted overflow-hidden relative">
                  <Image
                    src={course.coverUrl}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {course.totalChapters} 节课
                  </span>
                  <span className="font-medium">
                    {course.price === 0
                      ? "免费"
                      : `¥${(course.price / 100).toFixed(0)}`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/courses">查看全部课程</Link>
          </Button>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="container mx-auto px-4 py-16 border-t">
        <h2 className="text-2xl font-bold mb-8">最新教程</h2>
        <div className="space-y-6">
          {latestArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group flex gap-4 py-4 border-b last:border-0"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {article.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {article.summary}
                </p>
              </div>
              <div className="flex-shrink-0 text-xs text-muted-foreground pt-1">
                {new Date(article.date).toLocaleDateString("zh-CN")}
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/articles">查看全部教程</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
