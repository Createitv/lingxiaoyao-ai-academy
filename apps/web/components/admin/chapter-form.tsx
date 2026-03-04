"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { VideoUpload } from "./video-upload";

interface ChapterData {
  id?: string;
  courseId: string;
  index: number;
  title: string;
  content: string;
  videoId: string;
  isFree: boolean;
  duration: number;
}

export function ChapterForm({
  courseId,
  initial,
}: {
  courseId: string;
  initial?: ChapterData;
}) {
  const router = useRouter();
  const isEditing = !!initial?.id;

  const [form, setForm] = useState<ChapterData>({
    courseId,
    index: initial?.index ?? 1,
    title: initial?.title ?? "",
    content: initial?.content ?? "",
    videoId: initial?.videoId ?? "",
    isFree: initial?.isFree ?? false,
    duration: initial?.duration ?? 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/admin/courses/${courseId}/chapters/${initial!.id}`
        : `/api/admin/courses/${courseId}/chapters`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "保存失败");
        return;
      }

      router.push(`/admin/courses/${courseId}/chapters`);
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("确定删除此章节吗？")) return;
    setSaving(true);

    try {
      await fetch(`/api/admin/courses/${courseId}/chapters/${initial!.id}`, {
        method: "DELETE",
      });
      router.push(`/admin/courses/${courseId}/chapters`);
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
            <label className="mb-1.5 block text-sm font-medium">章节标题</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="章节标题"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              章节内容（Markdown）
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
              rows={18}
              placeholder="# 本节要点&#10;&#10;- 要点1&#10;- 要点2"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <h3 className="font-medium">章节设置</h3>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                章节序号
              </label>
              <input
                type="number"
                value={form.index}
                onChange={(e) =>
                  setForm({ ...form, index: parseInt(e.target.value) || 1 })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                min={1}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">视频</label>
              <VideoUpload
                videoId={form.videoId}
                onUploadComplete={({ fileId, duration }) =>
                  setForm({ ...form, videoId: fileId, duration })
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                时长（分钟）
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                min={0}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                上传视频后自动填入，也可手动修改
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                className="rounded border"
              />
              免费章节
            </label>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex flex-col gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
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
