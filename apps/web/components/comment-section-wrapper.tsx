"use client";

import { useState, useEffect } from "react";
import { CommentSection } from "@workspace/ui/components/comment-section";
import type { Comment, ContentType } from "@workspace/types";

interface CommentSectionWrapperProps {
  contentType: ContentType;
  contentSlug: string;
}

export function CommentSectionWrapper({
  contentType,
  contentSlug,
}: CommentSectionWrapperProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [commentsRes, meRes] = await Promise.all([
        fetch(
          `/api/comments?type=${contentType}&slug=${encodeURIComponent(contentSlug)}`,
        ),
        fetch("/api/auth/me").catch(() => null),
      ]);

      if (commentsRes.ok) {
        const data = await commentsRes.json();
        setComments(data.data ?? []);
      }

      if (meRes?.ok) {
        const data = await meRes.json();
        setCurrentUserId(data.data?.id);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [contentType, contentSlug]);

  const handleSubmit = async (body: string, parentId?: string) => {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType, contentSlug, body, parentId }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "发送失败");
    }

    const data = await res.json();
    setComments((prev) => [data.data, ...prev]);
  };

  const handleDelete = async (commentId: string) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    });

    if (!res.ok) return;

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, isDeleted: true } : c,
      ),
    );
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">加载评论中...</div>;
  }

  return (
    <CommentSection
      contentType={contentType}
      contentSlug={contentSlug}
      comments={comments}
      currentUserId={currentUserId}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}
