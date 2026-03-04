import React from "react";
import { cn } from "../lib/utils";

interface WechatFollowCardProps {
  qrcodeUrl?: string;
  accountName?: string;
  description?: string;
  className?: string;
}

export function WechatFollowCard({
  qrcodeUrl,
  accountName = "lingxiaoyao",
  description = "关注公众号，获取最新 AI 教程和课程更新",
  className,
}: WechatFollowCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 border rounded-lg bg-muted/50",
        className,
      )}
    >
      <div className="flex-shrink-0">
        {qrcodeUrl ? (
          <img
            src={qrcodeUrl}
            alt={`扫码关注 ${accountName}`}
            className="w-20 h-20 rounded"
          />
        ) : (
          <div className="w-20 h-20 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
            二维码
          </div>
        )}
      </div>
      <div>
        <div className="font-medium text-sm mb-1">微信公众号：{accountName}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
