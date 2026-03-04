/**
 * Auto-update module - checks for updates on startup,
 * downloads silently, installs and relaunches the app.
 */
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export async function checkForUpdates(): Promise<void> {
  try {
    const update = await check();
    if (update) {
      console.log(`[Updater] 发现新版本: ${update.version}`);
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            console.log(
              `[Updater] 开始下载, 大小: ${event.data.contentLength ?? "未知"}`
            );
            break;
          case "Progress":
            console.log(`[Updater] 已下载 ${event.data.chunkLength} bytes`);
            break;
          case "Finished":
            console.log("[Updater] 下载完成");
            break;
        }
      });
      await relaunch();
    } else {
      console.log("[Updater] 当前已是最新版本");
    }
  } catch (error) {
    console.error("[Updater] 检查更新失败:", error);
  }
}
