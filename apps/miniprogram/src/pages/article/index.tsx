import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { getArticleBySlug } from "@/services/articles";
import { markComplete, unmarkComplete } from "@/services/progress";
import { isLoggedIn } from "@/services/auth";
import RichContent from "@/components/rich-content";
import CommentSection from "@/components/comment-section";
import "./index.scss";

interface ArticleData {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  readingTime: number;
  source: string;
}

export default function ArticlePage() {
  const router = useRouter();
  const slug = router.params.slug ?? "";

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (slug) loadArticle();
  }, [slug]);

  async function loadArticle() {
    setLoading(true);
    const data = await getArticleBySlug(slug);
    setArticle(data);
    setLoading(false);
    if (data) {
      Taro.setNavigationBarTitle({ title: data.title });
    }
  }

  async function handleToggleComplete() {
    if (!isLoggedIn()) return;

    if (completed) {
      await unmarkComplete("article", slug);
      setCompleted(false);
    } else {
      await markComplete("article", slug);
      setCompleted(true);
    }
  }

  if (loading) {
    return (
      <View className="loading-container">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View className="loading-container">
        <Text className="loading-text">文章不存在</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY className="article-page">
      {/* Article Header */}
      <View className="article-header">
        <Text className="article-title">{article.title}</Text>
        <View className="article-meta">
          <Text className="meta-date">{article.date}</Text>
          <Text className="meta-time">{article.readingTime} 分钟阅读</Text>
        </View>
        {article.tags?.length > 0 && (
          <View className="tag-list">
            {article.tags.map((tag) => (
              <Text key={tag} className="tag-item">
                {tag}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Article Content */}
      <View className="article-content">
        <RichContent source={article.source} />
      </View>

      {/* Progress Button */}
      {isLoggedIn() && (
        <View className="progress-area">
          <View
            className={`progress-btn ${completed ? "completed" : ""}`}
            onClick={handleToggleComplete}
          >
            <Text className="progress-text">
              {completed ? "已读完" : "标记为已读"}
            </Text>
          </View>
        </View>
      )}

      {/* Comments */}
      <CommentSection contentType="article" contentSlug={slug} />
    </ScrollView>
  );
}
