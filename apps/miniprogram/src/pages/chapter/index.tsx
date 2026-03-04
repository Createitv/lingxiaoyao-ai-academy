import { useState, useEffect } from "react";
import { View, Text, Video, ScrollView } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { getChapterContent } from "@/services/courses";
import { markComplete, unmarkComplete } from "@/services/progress";
import { isLoggedIn } from "@/services/auth";
import RichContent from "@/components/rich-content";
import CommentSection from "@/components/comment-section";
import "./index.scss";

interface ChapterData {
  title: string;
  videoId: string;
  isFree: boolean;
  duration: number;
  content?: string;
}

export default function ChapterPage() {
  const router = useRouter();
  const courseSlug = router.params.courseSlug ?? "";
  const chapterIndex = parseInt(router.params.index ?? "1", 10);

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (courseSlug) loadChapter();
  }, [courseSlug, chapterIndex]);

  async function loadChapter() {
    setLoading(true);
    const data = await getChapterContent(courseSlug, chapterIndex);
    setChapter(data);
    setLoading(false);
    if (data) {
      Taro.setNavigationBarTitle({ title: data.title });
    }
  }

  async function handleToggleComplete() {
    if (!isLoggedIn()) return;

    const slug = `${courseSlug}-${chapterIndex}`;
    if (completed) {
      await unmarkComplete("chapter", slug);
      setCompleted(false);
    } else {
      await markComplete("chapter", slug);
      setCompleted(true);
    }
  }

  function handleVideoEnded() {
    if (isLoggedIn() && !completed) {
      const slug = `${courseSlug}-${chapterIndex}`;
      markComplete("chapter", slug);
      setCompleted(true);
      Taro.showToast({ title: "已标记完成", icon: "success" });
    }
  }

  function goToChapter(index: number) {
    Taro.redirectTo({
      url: `/pages/chapter/index?courseSlug=${courseSlug}&index=${index}`,
    });
  }

  if (loading) {
    return (
      <View className="loading-container">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }

  if (!chapter) {
    return (
      <View className="loading-container">
        <Text className="loading-text">章节不存在或需要购买课程</Text>
      </View>
    );
  }

  return (
    <View className="chapter-page">
      {/* Video Player */}
      {chapter.videoId && (
        <Video
          className="video-player"
          src={chapter.videoId}
          controls
          showFullscreenBtn
          showPlayBtn
          enableProgressGesture
          onEnded={handleVideoEnded}
        />
      )}

      <ScrollView scrollY className="chapter-content">
        {/* Chapter Header */}
        <View className="chapter-header">
          <Text className="chapter-title">{chapter.title}</Text>
          <Text className="chapter-duration">{chapter.duration} 分钟</Text>
        </View>

        {/* Progress Button */}
        {isLoggedIn() && (
          <View className="progress-area">
            <View
              className={`progress-btn ${completed ? "completed" : ""}`}
              onClick={handleToggleComplete}
            >
              <Text className="progress-text">
                {completed ? "已完成" : "标记为已完成"}
              </Text>
            </View>
          </View>
        )}

        {/* Chapter Content (Markdown) */}
        {chapter.content && (
          <View className="content-area">
            <RichContent source={chapter.content} />
          </View>
        )}

        {/* Chapter Navigation */}
        <View className="chapter-nav">
          {chapterIndex > 1 && (
            <View
              className="nav-btn prev"
              onClick={() => goToChapter(chapterIndex - 1)}
            >
              <Text className="nav-text">上一节</Text>
            </View>
          )}
          <View
            className="nav-btn next"
            onClick={() => goToChapter(chapterIndex + 1)}
          >
            <Text className="nav-text">下一节</Text>
          </View>
        </View>

        {/* Comments */}
        <CommentSection
          contentType="chapter"
          contentSlug={`${courseSlug}-${chapterIndex}`}
        />
      </ScrollView>
    </View>
  );
}
