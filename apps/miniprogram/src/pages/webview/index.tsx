import { WebView } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";

export default function WebviewPage() {
  const router = useRouter();
  const url = decodeURIComponent(router.params.url ?? "");

  if (!url) {
    Taro.navigateBack();
    return null;
  }

  return <WebView src={url} />;
}
