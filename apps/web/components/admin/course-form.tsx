"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ImageUpload } from "./image-upload";

interface CourseData {
  id?: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  price: number;
  coverUrl: string;
  publishedAt: string | null;
}

export function CourseForm({ initial }: { initial?: CourseData }) {
  const router = useRouter();
  const isEditing = !!initial?.id;

  const [form, setForm] = useState<CourseData>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    content: initial?.content ?? "",
    price: initial?.price ?? 0,
    coverUrl: initial?.coverUrl ?? "",
    publishedAt: initial?.publishedAt ?? null,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
        ? `/api/admin/courses/${initial!.id}`
        : "/api/admin/courses";
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

      router.push("/admin/courses");
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("确定删除这门课程吗？关联的章节也会被删除。此操作不可撤销。"))
      return;
    setSaving(true);

    try {
      await fetch(`/api/admin/courses/${initial!.id}`, { method: "DELETE" });
      router.push("/admin/courses");
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
        <div className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">课程名称</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="课程名称"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
              placeholder="course-slug"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">简介</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="一段简短的课程介绍..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              详细介绍（Markdown）
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
              rows={15}
              placeholder="# 课程介绍&#10;&#10;详细内容..."
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* 章节管理入口 */}
          {isEditing && (
            <div className="rounded-lg border bg-card p-4">
              <Button asChild className="w-full">
                <Link href={`/admin/courses/${initial!.id}/chapters`}>
                  管理章节
                </Link>
              </Button>
            </div>
          )}

          <div className="rounded-lg border bg-card p-4 space-y-4">
            <h3 className="font-medium">课程设置</h3>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                价格（元）
              </label>
              <input
                type="number"
                value={form.price / 100}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: Math.round(parseFloat(e.target.value) * 100) || 0,
                  })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                min={0}
                step={0.01}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                实际存储: {form.price} 分
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">封面图</label>
              <ImageUpload
                value={form.coverUrl}
                onChange={(url) => setForm({ ...form, coverUrl: url })}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h3 className="font-medium">操作</h3>

            {form.publishedAt ? (
              <div className="text-sm text-green-600 dark:text-green-400">
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
