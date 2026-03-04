import { PropsWithChildren } from "react";
import { useLaunch } from "@tarojs/taro";
import { login } from "@/services/auth";
import "./app.scss";

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    // Auto-login on app launch
    login().catch((err) => {
      console.error("[App] Auto login failed:", err);
    });
  });

  return children;
}

export default App;
