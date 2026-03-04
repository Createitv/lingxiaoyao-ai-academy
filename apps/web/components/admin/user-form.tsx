"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";

interface UserFormData {
  id: string;
  nickname: string;
  avatarUrl: string;
  role: "user" | "admin";
  hasWechat: boolean;
  hasMiniProgram: boolean;
  createdAt: string;
  stats: {
    orders: number;
    comments: number;
    userCourses: number;
    progress: number;
  };
}

export function UserForm({ initial }: { initial: UserFormData }) {
  const router = useRouter();

  const [form, setForm] = useState({
    nickname: initial.nickname,
    role: initial.role,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "保存失败");
        return;
      }

      router.push("/admin/users");
      router.refresh();
    } catch {
      setError("网络错误");
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
            <label className="mb-1.5 block text-sm font-medium">昵称</label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">角色</label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as "user" | "admin" })
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <h3 className="font-medium">用户信息</h3>

            {initial.avatarUrl && (
              <div className="flex justify-center">
                <img
                  src={initial.avatarUrl}
                  alt=""
                  className="h-16 w-16 rounded-full"
                />
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="max-w-[180px] truncate font-mono text-xs">
                  {initial.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">注册时间</span>
                <span>
                  {new Date(initial.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">登录方式</span>
                <div className="flex gap-1">
                  {initial.hasWechat && (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      微信
                    </span>
                  )}
                  {initial.hasMiniProgram && (
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      小程序
                    </span>
                  )}
                  {!initial.hasWechat && !initial.hasMiniProgram && (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-4">
            <h3 className="font-medium">活动统计</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-accent p-3 text-center">
                <p className="text-lg font-bold">{initial.stats.userCourses}</p>
                <p className="text-xs text-muted-foreground">已购课程</p>
              </div>
              <div className="rounded-md bg-accent p-3 text-center">
                <p className="text-lg font-bold">{initial.stats.orders}</p>
                <p className="text-xs text-muted-foreground">订单数</p>
              </div>
              <div className="rounded-md bg-accent p-3 text-center">
                <p className="text-lg font-bold">{initial.stats.comments}</p>
                <p className="text-xs text-muted-foreground">评论数</p>
              </div>
              <div className="rounded-md bg-accent p-3 text-center">
                <p className="text-lg font-bold">{initial.stats.progress}</p>
                <p className="text-xs text-muted-foreground">完成进度</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h3 className="font-medium">操作</h3>
            <div className="flex flex-col gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
