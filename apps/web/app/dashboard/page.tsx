import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserCourses } from "@/lib/db/user-courses";
import { getUserProgress } from "@/lib/db/progress";

export const metadata: Metadata = {
  title: "我的学习",
  description: "查看已购课程和学习进度",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/api/auth/wechat/init?redirect=/dashboard");
  }

  const [userCourses, progressRecords] = await Promise.all([
    getUserCourses(user.id),
    getUserProgress(user.id),
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-10">
        {user.avatarUrl && (
          <Image
            src={user.avatarUrl}
            alt={user.nickname}
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">你好，{user.nickname}</h1>
          <p className="text-muted-foreground text-sm">继续你的学习之旅</p>
        </div>
      </div>

      <div className="mb-6 flex gap-4 text-sm">
        <Link
          href="/dashboard/orders"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          我的订单 →
        </Link>
      </div>

      {/* My Courses */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">我的课程</h2>
        {userCourses.length === 0 ? (
          <div className="border rounded-xl p-8 text-center text-muted-foreground">
            <p>还没有购买课程</p>
            <Link
              href="/courses"
              className="mt-4 inline-block text-sm text-primary underline"
            >
              浏览课程
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCourses.map(({ course, completedChapters }) => {
              const progress =
                course.totalChapters > 0
                  ? Math.round(
                      (completedChapters / course.totalChapters) * 100,
                    )
                  : 0;

              return (
                <Link
                  key={course.slug}
                  href={`/courses/${course.slug}`}
                  className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {course.coverUrl && (
                    <div className="aspect-video bg-muted relative">
                      <Image
                        src={course.coverUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium mb-2">{course.title}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {completedChapters}/{course.totalChapters} 节
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Progress */}
      <section>
        <h2 className="text-xl font-semibold mb-4">最近学习</h2>
        {progressRecords.length === 0 ? (
          <p className="text-muted-foreground text-sm">暂无学习记录</p>
        ) : (
          <div className="space-y-2">
            {progressRecords.slice(0, 10).map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
                <span className="text-green-500">✅</span>
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {record.contentType === "article"
                      ? "文章"
                      : record.contentType === "chapter"
                        ? "课程章节"
                        : "文档"}
                    ：
                  </span>
                  {record.contentSlug}
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {new Date(record.completedAt).toLocaleDateString("zh-CN")}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
