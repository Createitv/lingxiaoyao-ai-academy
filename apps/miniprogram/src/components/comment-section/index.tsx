import { useState, useEffect } from "react";
import { View, Text, Textarea, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { getComments, createComment, deleteComment } from "@/services/comments";
import { isLoggedIn, getUser } from "@/services/auth";
import type { Comment, ContentType } from "@workspace/types";
import "./index.scss";

interface CommentSectionProps {
  contentType: ContentType;
  contentSlug: string;
}

export default function CommentSection({
  contentType,
  contentSlug,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [replyTo, setReplyTo] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const user = getUser();

  useEffect(() => {
    loadComments();
  }, [contentType, contentSlug]);

  async function loadComments() {
    const list = await getComments(contentType, contentSlug);
    setComments(list);
  }

  async function handleSubmit() {
    if (!inputValue.trim()) return;
    if (!isLoggedIn()) {
      Taro.showToast({ title: "请先登录", icon: "none" });
      return;
    }

    setSubmitting(true);
    const result = await createComment(
      contentType,
      contentSlug,
      inputValue.trim(),
      replyTo,
    );
    setSubmitting(false);

    if (result) {
      setInputValue("");
      setReplyTo(undefined);
      loadComments();
    } else {
      Taro.showToast({ title: "发送失败", icon: "error" });
    }
  }

  async function handleDelete(commentId: string) {
    const res = await Taro.showModal({
      title: "确认删除",
      content: "确定要删除这条评论吗？",
    });
    if (!res.confirm) return;

    const success = await deleteComment(commentId);
    if (success) {
      loadComments();
    }
  }

  const topLevelComments = comments.filter((c) => !c.parentId && !c.isDeleted);

  return (
    <View className="comment-section">
      <Text className="comment-title">
        评论 ({topLevelComments.length})
      </Text>

      {/* Comment Input */}
      {isLoggedIn() ? (
        <View className="comment-form">
          {replyTo && (
            <View className="reply-hint">
              <Text className="reply-text">
                回复评论
              </Text>
              <Text
                className="cancel-reply"
                onClick={() => setReplyTo(undefined)}
              >
                取消
              </Text>
            </View>
          )}
          <View className="input-row">
            <Textarea
              className="comment-input"
              value={inputValue}
              onInput={(e) => setInputValue(e.detail.value)}
              placeholder="写下你的评论..."
              maxlength={2000}
              autoHeight
            />
            <View
              className={`send-btn ${submitting ? "disabled" : ""}`}
              onClick={submitting ? undefined : handleSubmit}
            >
              <Text className="send-text">发送</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="login-hint">
          <Text className="hint-text">登录后参与评论</Text>
        </View>
      )}

      {/* Comment List */}
      <View className="comment-list">
        {topLevelComments.map((comment) => (
          <View key={comment.id} className="comment-item">
            <View className="comment-header">
              <View className="user-info">
                {comment.user.avatarUrl ? (
                  <Image
                    className="avatar"
                    src={comment.user.avatarUrl}
                    mode="aspectFill"
                  />
                ) : (
                  <View className="avatar-placeholder">
                    <Text className="avatar-letter">
                      {comment.user.nickname?.charAt(0) ?? "?"}
                    </Text>
                  </View>
                )}
                <Text className="nickname">{comment.user.nickname}</Text>
              </View>
              <Text className="comment-time">
                {formatTime(comment.createdAt)}
              </Text>
            </View>
            <Text className="comment-body">{comment.body}</Text>
            <View className="comment-actions">
              <Text
                className="action-btn"
                onClick={() => setReplyTo(comment.id)}
              >
                回复
              </Text>
              {user?.id === comment.userId && (
                <Text
                  className="action-btn delete"
                  onClick={() => handleDelete(comment.id)}
                >
                  删除
                </Text>
              )}
            </View>

            {/* Replies */}
            {comments
              .filter((r) => r.parentId === comment.id && !r.isDeleted)
              .map((reply) => (
                <View key={reply.id} className="reply-item">
                  <View className="comment-header">
                    <View className="user-info">
                      <Text className="nickname">{reply.user.nickname}</Text>
                    </View>
                    <Text className="comment-time">
                      {formatTime(reply.createdAt)}
                    </Text>
                  </View>
                  <Text className="comment-body">{reply.body}</Text>
                  {user?.id === reply.userId && (
                    <Text
                      className="action-btn delete"
                      onClick={() => handleDelete(reply.id)}
                    >
                      删除
                    </Text>
                  )}
                </View>
              ))}
          </View>
        ))}
      </View>

      {topLevelComments.length === 0 && (
        <View className="empty-comments">
          <Text className="empty-text">暂无评论，来发表第一条吧</Text>
        </View>
      )}
    </View>
  );
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60_000) return "刚刚";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} 小时前`;
  if (diff < 2592000_000) return `${Math.floor(diff / 86400_000)} 天前`;

  return `${d.getMonth() + 1}/${d.getDate()}`;
}
