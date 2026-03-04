"use client";

import { useState, useRef } from "react";
import { Button } from "@workspace/ui/components/button";

interface VideoUploadProps {
  videoId: string;
  onUploadComplete: (result: { fileId: string; duration: number }) => void;
}

export function VideoUpload({ videoId, onUploadComplete }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function getSignature(): Promise<string> {
    const res = await fetch("/api/admin/upload/video", { method: "POST" });
    const data = await res.json();
    if (!data.success) throw new Error(data.error ?? "获取签名失败");
    return data.data.signature;
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setProgress(0);
    setError("");
    setFileName(file.name);

    try {
      const { default: TcVod } = await import("vod-js-sdk-v6");

      const tcVod = new TcVod({
        getSignature,
      });

      const uploader = tcVod.upload({
        mediaFile: file,
      });

      uploader.on("media_progress", (info: { percent: number }) => {
        setProgress(Math.round(info.percent * 100));
      });

      const result = await uploader.done();
      const fileId = result.fileId;

      // Get video duration from the file itself
      const duration = await getVideoDuration(file);

      onUploadComplete({ fileId, duration: Math.ceil(duration / 60) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {videoId && !uploading && (
        <div className="rounded-md border bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">当前视频 FileId</p>
          <p className="mt-0.5 break-all font-mono text-sm">{videoId}</p>
        </div>
      )}

      {uploading ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate text-muted-foreground">{fileName}</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => inputRef.current?.click()}
        >
          {videoId ? "重新上传视频" : "上传视频"}
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration || 0);
    };
    video.onerror = () => resolve(0);
    video.src = URL.createObjectURL(file);
  });
}
