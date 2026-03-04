import { useState } from "react";
import { View, Text, Image, ScrollView } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { getCourses } from "@/services/courses";
import "./index.scss";

interface CourseItem {
  slug: string;
  title: string;
  description: string;
  price: number;
  coverUrl?: string;
  totalChapters: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useDidShow(() => {
    loadCourses();
  });

  async function loadCourses() {
    setLoading(true);
    const list = await getCourses();
    setCourses(list);
    setLoading(false);
  }

  function goToDetail(slug: string) {
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
    <ScrollView scrollY className="courses-page">
      <View className="page-header">
        <Text className="page-title">全部课程</Text>
        <Text className="page-subtitle">系统学习 AI 工具，提升工作效率</Text>
      </View>

      <View className="course-grid">
        {courses.map((course) => (
          <View
            key={course.slug}
            className="course-card"
            onClick={() => goToDetail(course.slug)}
          >
            {course.coverUrl ? (
              <Image
                className="course-cover"
                src={course.coverUrl}
                mode="aspectFill"
              />
            ) : (
              <View className="course-cover-placeholder">
                <Text className="placeholder-text">
                  {course.title.slice(0, 2)}
                </Text>
              </View>
            )}
            <View className="course-body">
              <Text className="course-title">{course.title}</Text>
              <Text className="course-desc">{course.description}</Text>
              <View className="course-footer">
                <Text className="course-chapters">
                  {course.totalChapters} 节课
                </Text>
                <Text className="course-price">
                  {course.price === 0
                    ? "免费"
                    : `¥${(course.price / 100).toFixed(0)}`}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {courses.length === 0 && !loading && (
        <View className="empty-state">
          <Text className="empty-text">暂无课程</Text>
        </View>
      )}
    </ScrollView>
  );
}
