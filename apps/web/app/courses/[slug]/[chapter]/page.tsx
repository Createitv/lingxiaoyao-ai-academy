import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { getChapterContent, getCourseBySlug } from "@/lib/content/courses";
import { getCurrentUser } from "@/lib/auth/session";
import { hasCoursePurchased } from "@/lib/db/user-courses";
import { VideoPlayer } from "@workspace/ui/components/video-player";
import { ProgressButton } from "@workspace/ui/components/progress-button";
import { CommentSectionWrapper } from "@/components/comment-section-wrapper";
import Link from "next/link";

interface ChapterPageProps {
  params: Promise<{ slug: string; chapter: string }>;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { slug, chapter } = await params;
  const chapterContent = await getChapterContent(slug, parseInt(chapter));
  if (!chapterContent) return {};

  return {
    title: chapterContent.title,
    description: `${chapterContent.title} — ${slug} 课程第 ${chapter} 节`,
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
  if (!chapterContent.isFree) {
    const user = await getCurrentUser();
    if (!user) {
      redirect(`/api/auth/wechat/init?redirect=/courses/${slug}/${chapter}`);
    }
    const hasPurchased = await hasCoursePurchased(user.id, course.id);
    if (!hasPurchased) {
      redirect(`/courses/${slug}`);
    }
  }

  const prevChapter = course.chapters.find((c) => c.index === chapterIndex - 1);
  const nextChapter = course.chapters.find((c) => c.index === chapterIndex + 1);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
      {chapterContent.source && (
        <div className="prose prose-zinc dark:prose-invert max-w-none mb-8">
          <MDXRemote
            source={chapterContent.source}
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
        isCompleted={false}
      />

      <div className="mt-8">
        <CommentSectionWrapper
          contentType="chapter"
          contentSlug={`${slug}-${chapterIndex}`}
        />
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
