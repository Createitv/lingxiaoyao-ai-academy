import { useState } from "react";
import { View, Text, Image, ScrollView } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { request } from "@/utils/request";
import { getProgress } from "@/services/progress";
import { isLoggedIn, getUser, login } from "@/services/auth";
import type { UserProgress } from "@workspace/types";
import "./index.scss";

interface UserCourse {
  course: {
    slug: string;
    title: string;
    coverUrl?: string;
    totalChapters: number;
  };
  completedChapters: number;
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [recentProgress, setRecentProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const user = getUser();

  useDidShow(() => {
    if (!isLoggedIn()) {
      login().then(() => loadData());
    } else {
      loadData();
    }
  });

  async function loadData() {
    setLoading(true);

    const [coursesRes, progress] = await Promise.all([
      request<UserCourse[]>({
        url: "/api/dashboard/courses",
        needAuth: true,
      }),
      getProgress(),
    ]);

    setCourses(coursesRes.data ?? []);
    setRecentProgress(progress.slice(0, 10));
    setLoading(false);
  }

  function goToCourse(slug: string) {
    Taro.navigateTo({ url: `/pages/course-detail/index?slug=${slug}` });
  }

  if (loading && courses.length === 0) {
    return (
      <View className="loading-container">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY className="dashboard-page">
      {/* Greeting */}
      <View className="greeting">
        <Text className="greeting-text">
          你好，{user?.nickname ?? "同学"}
        </Text>
        <Text className="greeting-subtitle">继续你的学习之旅</Text>
      </View>

      {/* My Courses */}
      <View className="section">
        <Text className="section-title">我的课程</Text>
        {courses.length > 0 ? (
          <View className="course-list">
            {courses.map((item) => (
              <View
                key={item.course.slug}
                className="course-card"
                onClick={() => goToCourse(item.course.slug)}
              >
                {item.course.coverUrl ? (
                  <Image
                    className="course-cover"
                    src={item.course.coverUrl}
                    mode="aspectFill"
                  />
                ) : (
                  <View className="course-cover-placeholder">
                    <Text className="placeholder-text">
                      {item.course.title.slice(0, 2)}
                    </Text>
                  </View>
                )}
                <View className="course-info">
                  <Text className="course-title">{item.course.title}</Text>
                  <View className="progress-bar-container">
                    <View
                      className="progress-bar"
                      style={{
                        width: `${Math.round(
                          (item.completedChapters / item.course.totalChapters) *
                            100,
                        )}%`,
                      }}
                    />
                  </View>
                  <Text className="progress-text">
                    {item.completedChapters}/{item.course.totalChapters} 节
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="empty-state">
            <Text className="empty-text">还没有课程</Text>
            <View
              className="browse-btn"
              onClick={() => Taro.switchTab({ url: "/pages/courses/index" })}
            >
              <Text className="browse-text">去看看课程</Text>
            </View>
          </View>
        )}
      </View>

      {/* Recent Progress */}
      {recentProgress.length > 0 && (
        <View className="section">
          <Text className="section-title">最近学习</Text>
          <View className="progress-list">
            {recentProgress.map((item) => (
              <View key={item.id} className="progress-item">
                <Text className="progress-type">
                  {item.contentType === "chapter"
                    ? "章节"
                    : item.contentType === "article"
                      ? "文章"
                      : "文档"}
                </Text>
                <Text className="progress-slug">{item.contentSlug}</Text>
                <Text className="progress-date">
                  {new Date(item.completedAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
