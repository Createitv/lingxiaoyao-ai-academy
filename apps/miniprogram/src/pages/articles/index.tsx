import { useState } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { getArticles } from "@/services/articles";
import type { Article } from "@workspace/types";
import "./index.scss";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useDidShow(() => {
    loadArticles();
  });

  async function loadArticles() {
    setLoading(true);
    const list = await getArticles();
    setArticles(list);
    setLoading(false);
  }

  const allTags = [...new Set(articles.flatMap((a) => a.tags ?? []))];

  const filtered = selectedTag
    ? articles.filter((a) => a.tags?.includes(selectedTag))
    : articles;

  function goToArticle(slug: string) {
    Taro.navigateTo({ url: `/pages/article/index?slug=${slug}` });
  }

  return (
    <ScrollView scrollY className="articles-page">
      <View className="page-header">
        <Text className="page-title">文章</Text>
      </View>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <ScrollView scrollX className="tag-filter">
          <View className="tag-list">
            <Text
              className={`tag-item ${!selectedTag ? "active" : ""}`}
              onClick={() => setSelectedTag(null)}
            >
              全部
            </Text>
            {allTags.map((tag) => (
              <Text
                key={tag}
                className={`tag-item ${selectedTag === tag ? "active" : ""}`}
                onClick={() =>
                  setSelectedTag(tag === selectedTag ? null : tag)
                }
              >
                {tag}
              </Text>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Article List */}
      <View className="article-list">
        {filtered.map((article) => (
          <View
            key={article.slug}
            className="article-card"
            onClick={() => goToArticle(article.slug)}
          >
            <Text className="article-title">{article.title}</Text>
            <Text className="article-summary">{article.summary}</Text>
            <View className="article-meta">
              <Text className="meta-date">{article.date}</Text>
              <Text className="meta-time">{article.readingTime} 分钟</Text>
            </View>
          </View>
        ))}

        {filtered.length === 0 && !loading && (
          <View className="empty-state">
            <Text className="empty-text">暂无文章</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
