import { View, Text, RichText } from "@tarojs/components";
import "./index.scss";

interface RichContentProps {
  source: string;
  className?: string;
}

/**
 * Renders Markdown content in mini program.
 * Converts basic Markdown to HTML for RichText component.
 * For complex MDX content, a build-time pre-processing step
 * should convert to JSON AST (see plan).
 */
export default function RichContent({ source, className }: RichContentProps) {
  const html = markdownToHtml(source);

  return (
    <View className={`rich-content ${className ?? ""}`}>
      <RichText nodes={html} />
    </View>
  );
}

function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Code blocks
  html = html.replace(
    /```[\w]*\n([\s\S]*?)```/g,
    '<pre style="background:#f6f8fa;padding:24rpx;border-radius:12rpx;overflow-x:auto;font-size:24rpx;line-height:1.6"><code>$1</code></pre>',
  );

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code style="background:#f6f8fa;padding:4rpx 12rpx;border-radius:6rpx;font-size:24rpx">$1</code>',
  );

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
  // Clean up nested ul tags
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Paragraphs (lines not already wrapped in tags)
  html = html.replace(/^(?!<[huplo])((?!<).+)$/gm, "<p>$1</p>");

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "");

  // Line breaks
  html = html.replace(/\n\n/g, "");

  return html;
}
