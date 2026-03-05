import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { getChapterContent, getCourseBySlug } from "@/lib/content/courses";
import { getCurrentUser } from "@/lib/auth/session";
import { hasCoursePurchased } from "@/lib/db/user-courses";
import { VideoPlayer } from "@workspace/ui/components/video-player";
import { ProgressButton } from "@workspace/ui/components/progress-button";
import { CommentSectionWrapper } from "@/components/comment-section-wrapper";
import { CourseSidebar } from "@/components/course-sidebar";
import Link from "next/link";
import { MdxRenderer } from "@/components/mdx/mdx-renderer";
import { prisma } from "@/lib/db/prisma";

export function generateStaticParams() {
  return [];
}

interface ChapterPageProps {
  params: Promise<{ slug: string; chapter: string }>;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { slug, chapter } = await params;
  const chapterIndex = parseInt(chapter);
  const chapterContent = await getChapterContent(slug, chapterIndex);
  if (!chapterContent) return {};

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";
  const chapterUrl = `${BASE_URL}/courses/${slug}/${chapter}`;
  const description = `${chapterContent.title} — 视频课程第 ${chapter} 节 · ${chapterContent.duration} 分钟`;

  return {
    title: chapterContent.title,
    description,
    keywords: [chapterContent.title, "视频课程", "AI教程", "Claude", "在线学习"],
    alternates: { canonical: chapterUrl },
    openGraph: {
      title: chapterContent.title,
      description,
      type: "video.other",
      url: chapterUrl,
      locale: "zh_CN",
      siteName: "林逍遥 AI",
    },
    twitter: {
      card: "summary_large_image",
      title: chapterContent.title,
      description,
    },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug, chapter } = await params;
  const chapterIndex = parseInt(chapter);
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const chapterContent = await getChapterContent(slug, chapterIndex);
  if (!chapterContent) notFound();

  // Access control
  const user = await getCurrentUser();
  let purchased = false;

  if (!chapterContent.isFree) {
    if (!user) {
      redirect(`/api/auth/wechat/init?redirect=/courses/${slug}/${chapter}`);
    }
    purchased = await hasCoursePurchased(user.id, course.id);
    if (!purchased) {
      redirect(`/courses/${slug}`);
    }
  } else if (user) {
    purchased = await hasCoursePurchased(user.id, course.id);
  }

  // Fetch user progress for all chapters in this course
  let completedSlugs: string[] = [];
  if (user) {
    const progressRecords = await prisma.userProgress.findMany({
      where: {
        userId: user.id,
        contentType: "chapter",
        contentSlug: {
          startsWith: `${slug}-`,
        },
      },
      select: { contentSlug: true },
    });
    completedSlugs = progressRecords.map((r) => r.contentSlug);
  }
  const completedSet = new Set(completedSlugs);

  const prevChapter = course.chapters.find((c) => c.index === chapterIndex - 1);
  const nextChapter = course.chapters.find((c) => c.index === chapterIndex + 1);

  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: chapterContent.title,
      description: `${chapterContent.title} — ${course.title} 课程第 ${chapterIndex} 节`,
      duration: `PT${chapterContent.duration}M`,
      contentUrl: `${BASE_URL}/courses/${slug}/${chapterIndex}`,
      thumbnailUrl: course.coverUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "课程",
          item: `${BASE_URL}/courses`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: course.title,
          item: `${BASE_URL}/courses/${slug}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: chapterContent.title,
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left sidebar navigation */}
      <CourseSidebar
        courseTitle={course.title}
        courseSlug={slug}
        chapters={course.chapters}
        currentChapter={chapterIndex}
        completedSlugs={completedSlugs}
        purchased={purchased}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 px-4 py-8 lg:px-8 max-w-4xl mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/courses" className="hover:text-foreground">
            课程
          </Link>
          {" / "}
          <Link href={`/courses/${slug}`} className="hover:text-foreground">
            {course.title}
          </Link>
          {" / "}
          <span>{chapterContent.title}</span>
        </nav>

        <h1 className="text-2xl font-bold mb-6">{chapterContent.title}</h1>

        {/* Video Player */}
        <div className="mb-8">
          <VideoPlayerWrapper
            courseSlug={slug}
            chapterIndex={chapterIndex}
            isFree={chapterContent.isFree}
            videoId={chapterContent.videoId}
          />
        </div>

        {/* MDX Content */}
        {chapterContent.content && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <MdxRenderer
              source={chapterContent.content}
              options={{
                mdxOptions: {
                  rehypePlugins: [rehypeHighlight, rehypeSlug],
                },
              }}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between border-t pt-6 mb-8">
          {prevChapter ? (
            <Link
              href={`/courses/${slug}/${prevChapter.index}`}
              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              ← {prevChapter.title}
            </Link>
          ) : (
            <div />
          )}
          {nextChapter ? (
            <Link
              href={`/courses/${slug}/${nextChapter.index}`}
              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              {nextChapter.title} →
            </Link>
          ) : (
            <div />
          )}
        </div>

        <ProgressButton
          contentType="chapter"
          contentSlug={`${slug}-${chapterIndex}`}
          isCompleted={completedSet.has(`${slug}-${chapterIndex}`)}
        />

        <div className="mt-8">
          <CommentSectionWrapper
            contentType="chapter"
            contentSlug={`${slug}-${chapterIndex}`}
          />
        </div>
      </div>
    </div>
  );
}

// Client component wrapper for video player
function VideoPlayerWrapper({
  courseSlug,
  chapterIndex,
  isFree,
  videoId,
}: {
  courseSlug: string;
  chapterIndex: number;
  isFree: boolean;
  videoId: string;
}) {
  // For free chapters, pass videoId directly
  // For paid chapters, the VideoPlayer fetches signed URL from API
  const videoUrl = isFree
    ? videoId
    : `/api/courses/${courseSlug}/chapters/${chapterIndex}/video-url`;

  return <VideoPlayer fileId={videoUrl} className="rounded-xl overflow-hidden" />;
}
