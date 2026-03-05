import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SearchCommand } from "@/components/search-command";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  fallback: [
    "PingFang SC",
    "Microsoft YaHei",
    "Hiragino Sans GB",
    "sans-serif",
  ],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn",
  ),
  title: {
    default: "林逍遥 AI — AI 课程与教程",
    template: "%s | 林逍遥 AI",
  },
  description:
    "学习 AI 工具、Claude 使用技巧，提升日常工作效率。免费教程 + 系统视频课程。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn",
    siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "林逍遥 AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "林逍遥 AI — AI 课程与教程",
    description:
      "学习 AI 工具、Claude 使用技巧，提升日常工作效率。免费教程 + 系统视频课程。",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      ...(process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION
        ? { "baidu-site-verification": process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION }
        : {}),
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const la51Id = process.env.NEXT_PUBLIC_51LA_ID;

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {la51Id && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(p){"use strict";!function(t){var s=window,e=document,i=p,c="".concat("https:"===e.location.protocol?"https://":"http://","sdk.51.la/js-sdk-pro.min.js"),n=e.createElement("script"),r=e.getElementsByTagName("script")[0];n.type="text/javascript",n.setAttribute("charset","UTF-8"),n.async=!0,n.src=c,n.id="LA_COLLECT",i.d=n;var o=function(){s.LA.ids.push(i)};s.LA?s.LA.ids&&o():(s.LA=p,s.LA.ids=[],o()),r.parentNode.insertBefore(n,r)}()}({id:"${la51Id}",ck:"${la51Id}"});`,
            }}
          />
        )}
        {process.env.NEXT_PUBLIC_BAIDU_PUSH === "true" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var bp=document.createElement('script');bp.src='https://zz.bdstatic.com/linksubmit/push.js';var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(bp,s)})();`,
            }}
          />
        )}
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <div className="min-h-[calc(100vh-3.5rem)]">{children}</div>
          <SiteFooter />
          <SearchCommand />
        </ThemeProvider>
      </body>
    </html>
  );
}
