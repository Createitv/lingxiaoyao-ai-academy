import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// Tencent VOD fileId format validation (alphanumeric + hyphens)
const SAFE_FILE_ID_RE = /^[a-zA-Z0-9_/-]+$/;
const SAFE_SLUG_RE = /^[a-zA-Z0-9_-]+$/;

interface RouteParams {
  params: Promise<{ courseSlug: string; index: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { courseSlug, index } = await params;

  // Validate courseSlug (prevent path traversal / injection)
  if (!SAFE_SLUG_RE.test(courseSlug)) {
    return NextResponse.json({ success: false, error: "无效参数" }, { status: 400 });
  }

  // Validate chapter index is a non-negative integer
  const chapterIndex = parseInt(index, 10);
  if (isNaN(chapterIndex) || chapterIndex < 0 || chapterIndex > 9999) {
    return NextResponse.json({ success: false, error: "无效的章节索引" }, { status: 400 });
  }

  // Get chapter info
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      chapters: {
        where: { index: chapterIndex },
      },
    },
  });

  if (!course || course.chapters.length === 0) {
    return NextResponse.json(
      { success: false, error: "章节不存在" },
      { status: 404 },
    );
  }

  const chapter = course.chapters[0]!;

  // Free chapters don't require auth
  if (!chapter.isFree) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 },
      );
    }

    const hasPurchased = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: { userId: user.id, courseId: course.id },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { success: false, error: "请先购买课程" },
        { status: 403 },
      );
    }
  }

  // Validate fileId from DB before using it
  if (!SAFE_FILE_ID_RE.test(chapter.videoId)) {
    console.error("[VideoURL] Invalid videoId in DB:", chapter.id);
    return NextResponse.json(
      { success: false, error: "视频资源异常，请联系客服" },
      { status: 500 },
    );
  }

  // Generate signed URL from Tencent VOD
  const expiresIn = parseInt(process.env.TENCENT_VOD_URL_EXPIRES ?? "1800", 10);
  const signedUrl = getTencentVodSignedUrl(chapter.videoId, expiresIn);

  return NextResponse.json({
    success: true,
    data: { url: signedUrl, expiresIn },
  });
}

/**
 * TODO: Replace with real Tencent VOD signed URL using tencentcloud-sdk-nodejs.
 * Reference: https://cloud.tencent.com/document/product/266/14047
 *
 * The placeholder below does NOT have a real cryptographic signature.
 * Before going to production, implement:
 *   1. Call DescribeMediaInfos to get playback info
 *   2. Generate KEY+expiretime HMAC-SHA256 signature
 */
function getTencentVodSignedUrl(fileId: string, expiresIn: number): string {
  const vodAppId = process.env.TENCENT_VOD_APP_ID ?? "";
  const currentTime = Math.floor(Date.now() / 1000);
  const expireTime = currentTime + expiresIn;

  // PLACEHOLDER — must be replaced before production
  return `https://vod.myqcloud.com/${vodAppId}/${fileId}/f0.mp4?t=${expireTime.toString(16)}`;
}
