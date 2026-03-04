import Link from "next/link";
import Image from "next/image";

const COS_BASE_URL = process.env.NEXT_PUBLIC_COS_BASE_URL;

const footerLinks = {
  学习: [
    { href: "/courses", label: "课程" },
    { href: "/articles", label: "文章" },
    { href: "/docs", label: "文档" },
  ],
  关于: [
    { href: "/about", label: "关于我" },
    { href: "/dashboard", label: "学习中心" },
  ],
};

const downloadLinks = COS_BASE_URL
  ? [
      {
        href: `${COS_BASE_URL}/desktop/latest/林逍遥AI_universal.dmg`,
        label: "macOS 下载",
        note: "Intel + Apple Silicon",
      },
      {
        href: `${COS_BASE_URL}/desktop/latest/林逍遥AI_x64-setup.exe`,
        label: "Windows 下载",
        note: "64 位",
      },
    ]
  : null;

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div
          className={`grid grid-cols-2 gap-8 ${downloadLinks ? "md:grid-cols-5" : "md:grid-cols-4"}`}
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="林逍遥 AI"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
              <span className="text-lg font-bold tracking-tight">
                林逍遥 AI
              </span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              用 AI，做更好的自己。
              <br />
              系统学习 Claude 和 AI 工具。
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Desktop download */}
          {downloadLinks && (
            <div>
              <h3 className="text-sm font-semibold">桌面客户端</h3>
              <ul className="mt-3 space-y-2">
                {downloadLinks.map((dl) => (
                  <li key={dl.href}>
                    <a
                      href={dl.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {dl.label}
                    </a>
                    <span className="ml-1 text-xs text-muted-foreground/60">
                      {dl.note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* WeChat */}
          <div>
            <h3 className="text-sm font-semibold">关注公众号</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              获取最新 AI 教程更新和免费资源。
            </p>
            <div className="mt-3 h-24 w-24 rounded-lg border bg-muted flex items-center justify-center text-xs text-muted-foreground">
              二维码
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} 林逍遥 AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/about"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              关于
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
