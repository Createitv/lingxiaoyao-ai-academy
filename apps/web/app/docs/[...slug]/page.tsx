import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { getDocBySlug, getAllDocSlugs } from "@/lib/content/docs";
import { ProgressButton } from "@workspace/ui/components/progress-button";

interface DocPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const slugs = await getAllDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);
  if (!doc) return {};

  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);
  if (!doc) notFound();

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{doc.title}</h1>
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <MDXRemote
          source={doc.source}
          options={{
            mdxOptions: {
              rehypePlugins: [rehypeHighlight, rehypeSlug],
            },
          }}
        />
      </div>
      <div className="mt-10 border-t pt-6">
        <ProgressButton
          contentType="doc"
          contentSlug={slug.join("/")}
          isCompleted={false}
        />
      </div>
    </article>
  );
}
