"use client";

import React, { useState } from "react";
import { cn } from "../lib/utils";
import type { Comment, ContentType } from "@workspace/types";

interface CommentSectionProps {
  contentType: ContentType;
  contentSlug: string;
  comments: Comment[];
  currentUserId?: string;
  className?: string;
  onSubmit?: (body: string, parentId?: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
}

export function CommentSection({
  contentType,
  contentSlug,
  comments,
  currentUserId,
  className,
  onSubmit,
  onDelete,
}: CommentSectionProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !onSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(body.trim(), replyToId);
      setBody("");
      setReplyToId(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const topLevelComments = comments.filter((c) => !c.parentId && !c.isDeleted);

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="font-semibold text-lg">
        评论 ({comments.filter((c) => !c.isDeleted).length})
      </h3>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          {replyToId && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>回复中...</span>
              <button
                type="button"
                onClick={() => setReplyToId(undefined)}
                className="underline"
              >
                取消
              </button>
            </div>
          )}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="写下你的评论..."
            className="w-full min-h-[100px] p-3 text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !body.trim()}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "发送中..." : "发表评论"}
          </button>
        </form>
      ) : (
        <div className="p-4 text-sm text-center text-muted-foreground border rounded-md">
          请先登录后再发表评论
        </div>
      )}

      <div className="space-y-4">
        {topLevelComments.map((comment) => {
          const replies = comments.filter(
            (c) => c.parentId === comment.id && !c.isDeleted,
          );
          return (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={replies}
              currentUserId={currentUserId}
              onReply={setReplyToId}
              onDelete={onDelete}
            />
          );
        })}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  currentUserId?: string;
  onReply?: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
}

function CommentItem({
  comment,
  replies,
  currentUserId,
  onReply,
  onDelete,
}: CommentItemProps) {
  const isOwner = currentUserId === comment.userId;

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted overflow-hidden">
        {comment.user.avatarUrl && (
          <img
            src={comment.user.avatarUrl}
            alt={comment.user.nickname}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.user.nickname}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
          </span>
        </div>
        <p className="text-sm">{comment.body}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {onReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="hover:text-foreground"
            >
              回复
            </button>
          )}
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="hover:text-destructive"
            >
              删除
            </button>
          )}
        </div>
        {replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-muted">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                replies={[]}
                currentUserId={currentUserId}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
