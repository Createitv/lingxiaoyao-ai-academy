import { prisma } from "./prisma";
import type { Course } from "@workspace/types";

export async function hasCoursePurchased(
  userId: string,
  courseId: string,
): Promise<boolean> {
  const record = await prisma.userCourse.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  return record !== null;
}

export async function getUserCourses(userId: string): Promise<
  Array<{
    course: Course & { totalChapters: number; coverUrl?: string };
    completedChapters: number;
  }>
> {
  const userCourses = await prisma.userCourse.findMany({
    where: { userId },
    include: {
      course: true,
    },
    orderBy: { accessGrantedAt: "desc" },
  });

  const progress = await prisma.userProgress.findMany({
    where: {
      userId,
      contentType: "chapter",
    },
    select: { contentSlug: true },
  });

  const completedSlugs = new Set(progress.map((p) => p.contentSlug));

  return userCourses.map(({ course }) => {
    const completedChapters = Array.from(completedSlugs).filter((slug) =>
      slug.startsWith(`${course.slug}-`),
    ).length;

    return {
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        price: course.price,
        coverUrl: course.coverUrl ?? undefined,
        totalChapters: course.totalChapters,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
      completedChapters,
    };
  });
}
