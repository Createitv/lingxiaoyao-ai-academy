import { request } from "@/utils/request";
import type { Comment, ContentType } from "@workspace/types";

export async function getComments(
  contentType: ContentType,
  contentSlug: string,
): Promise<Comment[]> {
  const res = await request<Comment[]>({
    url: `/api/comments?type=${contentType}&slug=${encodeURIComponent(contentSlug)}`,
  });
  return res.data ?? [];
}

export async function createComment(
  contentType: ContentType,
  contentSlug: string,
  body: string,
  parentId?: string,
): Promise<Comment | null> {
  const res = await request<Comment>({
    url: "/api/comments",
    method: "POST",
    data: { contentType, contentSlug, body, parentId },
    needAuth: true,
  });
  return res.data ?? null;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const res = await request({
    url: `/api/comments/${commentId}`,
    method: "DELETE",
    needAuth: true,
  });
  return res.success;
}
