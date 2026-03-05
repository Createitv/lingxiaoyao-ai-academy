import { useState, useRef } from "react";
import { View, Text, Input, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { search, type SearchResult } from "@/services/search";
import "./index.scss";

const typeLabels: Record<string, string> = {
  article: "文章",
  course: "课程",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleInput(val: string) {
    setQuery(val);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (val.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const data = await search(val);
      setResults(data);
      setSearched(true);
      setLoading(false);
    }, 300);
  }

  function goToResult(item: SearchResult) {
    const urlMap: Record<string, string> = {
      article: `/pages/article/index?slug=${item.slug}`,
      course: `/pages/course-detail/index?slug=${item.slug}`,
    };
    const url = urlMap[item.type];
    if (url) Taro.navigateTo({ url });
  }

  return (
    <View className="search-page">
      {/* Search bar */}
      <View className="search-bar">
        <View className="search-icon">
          <Text className="icon-text">🔍</Text>
        </View>
        <Input
          className="search-input"
          placeholder="搜索文章、课程..."
          value={query}
          onInput={(e) => handleInput(e.detail.value)}
          focus
          confirmType="search"
        />
      </View>

      {/* Results */}
      <ScrollView scrollY className="search-results">
        {loading && (
          <View className="search-status">
            <Text className="status-text">搜索中...</Text>
          </View>
        )}

        {!loading && searched && results.length === 0 && (
          <View className="search-status">
            <Text className="status-text">没有找到相关结果</Text>
          </View>
        )}

        {!loading && !searched && (
          <View className="search-status">
            <Text className="status-text">输入关键词搜索文章和课程</Text>
          </View>
        )}

        {results.map((item) => (
          <View
            key={`${item.type}-${item.slug}`}
            className="result-card"
            onClick={() => goToResult(item)}
          >
            <View className="result-header">
              <Text className="result-type">{typeLabels[item.type]}</Text>
              {item.meta?.series && (
                <Text className="result-series">{item.meta.series}</Text>
              )}
              {item.meta?.readingTime && (
                <Text className="result-meta">约 {item.meta.readingTime} 分钟</Text>
              )}
              {item.meta?.totalChapters && (
                <Text className="result-meta">
                  {item.meta.totalChapters} 节 · 视频课程
                </Text>
              )}
              {item.meta?.price !== undefined && (
                <Text className="result-price">
                  {item.meta.price === 0
                    ? "免费"
                    : `¥${(item.meta.price / 100).toFixed(0)}`}
                </Text>
              )}
            </View>
            <Text className="result-title">{item.title}</Text>
            {item.summary && (
              <Text className="result-summary">{item.summary}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
