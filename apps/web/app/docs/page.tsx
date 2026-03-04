import type { Metadata } from "next";
import Link from "next/link";
import { getAllDocs } from "@/lib/content/docs";

export const metadata: Metadata = {
  title: "参考文档",
  description: "AI 工具参考文档，Prompt 写法、Claude API、常见场景。",
};

export default async function DocsPage() {
  const docs = await getAllDocs();

  // Group by first slug segment (category)
  const categories = docs.reduce(
    (acc, doc) => {
      const category = doc.slug[0] ?? "general";
      if (!acc[category]) acc[category] = [];
      acc[category].push(doc);
      return acc;
    },
    {} as Record<string, typeof docs>,
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">参考文档</h1>
      <p className="text-muted-foreground mb-8">
        AI 工具使用手册，随查随用。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(categories).map(([category, categoryDocs]) => (
          <div key={category} className="space-y-2">
            <h2 className="font-semibold text-lg capitalize">{category}</h2>
            <ul className="space-y-1">
              {categoryDocs.map((doc) => (
                <li key={doc.slug.join("/")}>
                  <Link
                    href={`/docs/${doc.slug.join("/")}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {doc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
