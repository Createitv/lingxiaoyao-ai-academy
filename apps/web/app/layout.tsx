import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn",
  ),
  title: {
    default: "lingxiaoyao — AI 课程与教程",
    template: "%s | lingxiaoyao",
  },
  description:
    "学习 AI 工具、Claude 使用技巧，提升日常工作效率。免费教程 + 系统视频课程。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://lingxiaoyao.cn",
    siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "lingxiaoyao",
  },
  robots: {
    index: true,
    follow: true,
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
            defer
            src={`https://sdk.51.la/js-sdk-pro.min.js`}
            data-id={la51Id}
          />
        )}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
