"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { ImageUpload } from "./image-upload";

interface ArticleData {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverUrl: string;
  tags: string[];
  series: string;
  sortOrder: number;
  isFree: boolean;
  publishedAt: string | null;
}

export function ArticleForm({ initial }: { initial?: ArticleData }) {
  const router = useRouter();
  const isEditing = !!initial?.id;

  const [form, setForm] = useState<ArticleData>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    summary: initial?.summary ?? "",
    content: initial?.content ?? "",
    coverUrl: initial?.coverUrl ?? "",
    tags: initial?.tags ?? [],
    series: initial?.series ?? "",
    sortOrder: initial?.sortOrder ?? 0,
    isFree: initial?.isFree ?? true,
    publishedAt: initial?.publishedAt ?? null,
  });

  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
      .replace(/[\s]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  }

  async function handleSave(publish?: boolean) {
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      publishedAt:
        publish === true
          ? new Date().toISOString()
          : publish === false
            ? null
            : form.publishedAt,
    };

    try {
      const url = isEditing
        ? `/api/admin/articles/${initial!.id}`
        : "/api/admin/articles";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "保存失败");
        return;
      }

      router.push("/admin/articles");
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("确定删除这篇文章吗？此操作不可撤销。")) return;
    setSaving(true);

    try {
      await fetch(`/api/admin/articles/${initial!.id}`, { method: "DELETE" });
      router.push("/admin/articles");
      router.refresh();
    } catch {
      setError("删除失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">标题</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm({
                  ...form,
                  title,
                  ...(isEditing ? {} : { slug: generateSlug(title) }),
                });
              }}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="文章标题"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
              placeholder="article-slug"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">摘要</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="文章摘要..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              内容（Markdown）
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
              rows={20}
              placeholder="# 文章标题&#10;&#10;正文内容..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <h3 className="font-medium">发布设置</h3>

            <div>
              <label className="mb-1.5 block text-sm font-medium">封面图</label>
              <ImageUpload
                value={form.coverUrl}
                onChange={(url) => setForm({ ...form, coverUrl: url })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">系列</label>
              <input
                type="text"
                value={form.series}
                onChange={(e) => setForm({ ...form, series: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="如：30天学Claude"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">排序序号</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                min={0}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                系列文章按此排序，数字越小越靠前
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">标签</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="输入标签后回车"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  添加
                </Button>
              </div>
              {form.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-0.5 hover:text-destructive"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                className="rounded border"
              />
              免费文章
            </label>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h3 className="font-medium">操作</h3>

            {form.publishedAt ? (
              <div className="text-sm text-muted-foreground">
                已发布于{" "}
                {new Date(form.publishedAt).toLocaleDateString("zh-CN")}
              </div>
            ) : (
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                草稿状态
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={() => handleSave()} disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
              {!form.publishedAt && (
                <Button
                  variant="outline"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                >
                  发布
                </Button>
              )}
              {form.publishedAt && (
                <Button
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                >
                  下架
                </Button>
              )}
              {isEditing && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  删除
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
