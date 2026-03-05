import type { Metadata } from "next";
import { WechatFollowCard } from "@workspace/ui/components/wechat-follow-card";

export const metadata: Metadata = {
  title: "关于我",
  description: "关于林逍遥 AI — AI 课程教育平台",
};

export default function AboutPage(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">关于我</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p>
          你好！我是林逍遥，专注于 AI 工具教育，帮助更多人学会用 AI
          提升日常工作效率。
        </p>
        <p>
          这个网站汇集了我的 AI 学习笔记、实战教程和系统课程。
          所有免费内容可以直接阅读，视频课程支持购买解锁。
        </p>
        <h2>我在做什么</h2>
        <ul>
          <li>AI 工具使用教程（Claude、Notion AI 等）</li>
          <li>Prompt 工程实战指南</li>
          <li>面向非技术用户的 AI 入门课程</li>
        </ul>
        <h2>联系方式</h2>
        <p>欢迎通过微信公众号联系我，获取最新更新和课程信息。</p>
      </div>
      <div className="mt-8">
        <WechatFollowCard />
      </div>
    </div>
  );
}
