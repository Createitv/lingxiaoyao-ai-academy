"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

interface VideoPlayerProps {
  fileId: string;
  appId?: string;
  className?: string;
  autoplay?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export function VideoPlayer({
  fileId,
  appId,
  className,
  autoplay = false,
  onTimeUpdate,
  onEnded,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let player: unknown;

    const initPlayer = async () => {
      // Dynamic import to avoid SSR issues
      const { default: Player } = await import("xgplayer");

      player = new Player({
        el: containerRef.current!,
        url: fileId, // For Tencent VOD, this will be resolved via signed URL
        autoplay,
        fluid: true,
        lang: "zh-cn",
        videoAttributes: {
          controlsList: "nodownload",
        },
      });

      (player as { on: (event: string, cb: (...args: unknown[]) => void) => void }).on("timeupdate", () => {
        if (onTimeUpdate) {
          onTimeUpdate((player as { currentTime: number }).currentTime);
        }
      });

      (player as { on: (event: string, cb: (...args: unknown[]) => void) => void }).on("ended", () => {
        if (onEnded) {
          onEnded();
        }
      });

      playerRef.current = player;
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        (playerRef.current as { destroy: () => void }).destroy();
      }
    };
  }, [fileId, autoplay, onTimeUpdate, onEnded]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full aspect-video bg-black rounded-lg overflow-hidden", className)}
    />
  );
}
