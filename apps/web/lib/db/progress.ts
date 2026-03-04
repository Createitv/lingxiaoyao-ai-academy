import { prisma } from "./prisma";
import type { UserProgress } from "@workspace/types";

export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  const records = await prisma.userProgress.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
  });

  return records.map((r) => ({
    id: r.id,
    userId: r.userId,
    contentType: r.contentType as UserProgress["contentType"],
    contentSlug: r.contentSlug,
    completedAt: r.completedAt,
  }));
}
