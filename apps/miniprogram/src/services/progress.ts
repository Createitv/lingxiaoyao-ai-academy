import { request } from "@/utils/request";
import type { UserProgress, ContentType } from "@workspace/types";

export async function getProgress(): Promise<UserProgress[]> {
  const res = await request<UserProgress[]>({
    url: "/api/progress",
    needAuth: true,
  });
  return res.data ?? [];
}

export async function markComplete(
  contentType: ContentType,
  contentSlug: string,
): Promise<boolean> {
  const res = await request({
    url: "/api/progress",
    method: "POST",
    data: { contentType, contentSlug },
    needAuth: true,
  });
  return res.success;
}

export async function unmarkComplete(
  contentType: ContentType,
  contentSlug: string,
): Promise<boolean> {
  const res = await request({
    url: `/api/progress?type=${contentType}&slug=${encodeURIComponent(contentSlug)}`,
    method: "DELETE",
    needAuth: true,
  });
  return res.success;
}
