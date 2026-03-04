import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { getCourseBySlug } from "@/services/courses";
import { payForCourse } from "@/services/orders";
import { isLoggedIn, login } from "@/services/auth";
import "./index.scss";

interface ChapterItem {
  index: number;
  title: string;
  isFree: boolean;
  duration: number;
}

interface CourseDetail {
  slug: string;
  title: string;
  description: string;
  price: number;
  coverUrl?: string;
  totalChapters: number;
  source?: string;
  chapters: ChapterItem[];
}

export default function CourseDetailPage() {
  const router = useRouter();
  const slug = router.params.slug ?? "";

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (slug) loadCourse();
  }, [slug]);

  async function loadCourse() {
    setLoading(true);
    const data = await getCourseBySlug(slug);
    setCourse(data);
    setLoading(false);
    if (data) {
      Taro.setNavigationBarTitle({ title: data.title });
    }
  }

  async function handlePurchase() {
    if (!isLoggedIn()) {
      await login();
    }

    setPurchasing(true);
    const success = await payForCourse(slug);
    setPurchasing(false);

    if (success) {
      loadCourse();
    }
  }

  function goToChapter(chapterIndex: number) {
    Taro.navigateTo({
      url: `/pages/chapter/index?courseSlug=${slug}&index=${chapterIndex}`,
    });
  }

  if (loading) {
    return (
      <View className="loading-container">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View className="loading-container">
        <Text className="loading-text">课程不存在</Text>
      </View>
    );
  }

  return (
    <View className="course-detail-page">
      <ScrollView scrollY className="scroll-area">
        {/* Course Header */}
        <View className="course-header">
          <Text className="course-title">{course.title}</Text>
          <Text className="course-desc">{course.description}</Text>
          <View className="course-stats">
            <Text className="stat-item">{course.totalChapters} 节课</Text>
          </View>
        </View>

        {/* Chapter List */}
        <View className="chapter-section">
          <Text className="section-title">课程章节</Text>
          <View className="chapter-list">
            {course.chapters.map((chapter) => (
              <View
                key={chapter.index}
                className={`chapter-item ${chapter.isFree ? "free" : "locked"}`}
                onClick={() =>
                  chapter.isFree ? goToChapter(chapter.index) : undefined
                }
              >
                <View className="chapter-left">
                  <Text className="chapter-index">{chapter.index}</Text>
                  <View className="chapter-info">
                    <Text className="chapter-title">{chapter.title}</Text>
                    <Text className="chapter-duration">
                      {chapter.duration} 分钟
                    </Text>
                  </View>
                </View>
                <Text className="chapter-badge">
                  {chapter.isFree ? "免费" : "付费"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Course Benefits */}
        <View className="benefits-section">
          <Text className="section-title">课程包含</Text>
          <View className="benefits-list">
            <Text className="benefit-item">视频课程</Text>
            <Text className="benefit-item">图文讲义</Text>
            <Text className="benefit-item">永久访问</Text>
          </View>
        </View>

        {/* Spacer for bottom bar */}
        <View className="bottom-spacer" />
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View className="bottom-bar">
        <View className="price-area">
          <Text className="price-label">价格</Text>
          <Text className="price-value">
            {course.price === 0
              ? "免费"
              : `¥${(course.price / 100).toFixed(0)}`}
          </Text>
        </View>
        <View
          className={`buy-button ${purchasing ? "disabled" : ""}`}
          onClick={purchasing ? undefined : handlePurchase}
        >
          <Text className="buy-text">
            {purchasing
              ? "处理中..."
              : course.price === 0
                ? "免费获取"
                : "立即购买"}
          </Text>
        </View>
      </View>
    </View>
  );
}
