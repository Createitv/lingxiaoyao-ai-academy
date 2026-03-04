import { useState, useEffect } from "react";
import { View, Text, Image, ScrollView } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { getCourses } from "@/services/courses";
import { getArticles } from "@/services/articles";
import type { Article } from "@workspace/types";
import "./index.scss";

interface CourseItem {
  slug: string;
  title: string;
  description: string;
  price: number;
  coverUrl?: string;
  totalChapters: number;
}

export default function IndexPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useDidShow(() => {
    loadData();
  });

  async function loadData() {
    const [courseList, articleList] = await Promise.all([
      getCourses(),
      getArticles(),
    ]);
    setCourses(courseList);
    setArticles(articleList.slice(0, 3));
  }

  function goToCourse(slug: string) {
    Taro.navigateTo({ url: `/pages/course-detail/index?slug=${slug}` });
  }

  function goToArticle(slug: string) {
    Taro.navigateTo({ url: `/pages/article/index?slug=${slug}` });
  }

  return (
    <ScrollView scrollY className="index-page">
      {/* Hero Section */}
      <View className="hero">
        <Text className="hero-title">AI 不只是工具</Text>
        <Text className="hero-title">更是一种思维方式</Text>
        <Text className="hero-subtitle">
          从零开始，掌握 AI 时代的核心技能
        </Text>
      </View>

      {/* Courses Section */}
      <View className="section">
        <Text className="section-title">精选课程</Text>
        <View className="course-list">
          {courses.map((course) => (
            <View
              key={course.slug}
              className="course-card"
              onClick={() => goToCourse(course.slug)}
            >
              {course.coverUrl && (
                <Image
                  className="course-cover"
                  src={course.coverUrl}
                  mode="aspectFill"
                />
              )}
              <View className="course-info">
                <Text className="course-title">{course.title}</Text>
                <Text className="course-desc">{course.description}</Text>
                <View className="course-meta">
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
      </View>

      {/* Latest Articles */}
      {articles.length > 0 && (
        <View className="section">
          <Text className="section-title">最新文章</Text>
          <View className="article-list">
            {articles.map((article) => (
              <View
                key={article.slug}
                className="article-card"
                onClick={() => goToArticle(article.slug)}
              >
                <Text className="article-title">{article.title}</Text>
                <Text className="article-summary">{article.summary}</Text>
                <View className="article-meta">
                  <Text className="article-time">
                    {article.readingTime} 分钟阅读
                  </Text>
                  <View className="article-tags">
                    {article.tags?.slice(0, 2).map((tag) => (
                      <Text key={tag} className="article-tag">
                        {tag}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
