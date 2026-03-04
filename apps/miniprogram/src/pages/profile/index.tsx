import { useState } from "react";
import { View, Text, Image } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { isLoggedIn, getUser, login, logout } from "@/services/auth";
import "./index.scss";

export default function ProfilePage() {
  const [user, setUser] = useState(getUser());
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  useDidShow(() => {
    setUser(getUser());
    setLoggedIn(isLoggedIn());
  });

  async function handleLogin() {
    const result = await login();
    if (result) {
      setUser(result);
      setLoggedIn(true);
      Taro.showToast({ title: "登录成功", icon: "success" });
    }
  }

  function handleLogout() {
    Taro.showModal({
      title: "确认退出",
      content: "确定要退出登录吗？",
    }).then((res) => {
      if (res.confirm) {
        logout();
        setUser(null);
        setLoggedIn(false);
        Taro.showToast({ title: "已退出", icon: "success" });
      }
    });
  }

  return (
    <View className="profile-page">
      {/* User Card */}
      <View className="user-card">
        {loggedIn && user ? (
          <View className="user-info">
            {user.avatarUrl ? (
              <Image
                className="avatar"
                src={user.avatarUrl}
                mode="aspectFill"
              />
            ) : (
              <View className="avatar-placeholder">
                <Text className="avatar-letter">
                  {user.nickname?.charAt(0) ?? "?"}
                </Text>
              </View>
            )}
            <View className="user-text">
              <Text className="nickname">{user.nickname}</Text>
              <Text className="user-id">ID: {user.id?.slice(0, 8)}...</Text>
            </View>
          </View>
        ) : (
          <View className="login-prompt" onClick={handleLogin}>
            <View className="avatar-placeholder">
              <Text className="avatar-letter">?</Text>
            </View>
            <Text className="login-text">点击登录</Text>
          </View>
        )}
      </View>

      {/* Menu List */}
      <View className="menu-section">
        <View
          className="menu-item"
          onClick={() =>
            Taro.switchTab({ url: "/pages/dashboard/index" })
          }
        >
          <Text className="menu-label">学习中心</Text>
          <Text className="menu-arrow">&gt;</Text>
        </View>
        <View
          className="menu-item"
          onClick={() =>
            Taro.switchTab({ url: "/pages/courses/index" })
          }
        >
          <Text className="menu-label">浏览课程</Text>
          <Text className="menu-arrow">&gt;</Text>
        </View>
      </View>

      <View className="menu-section">
        <View className="menu-item">
          <Text className="menu-label">关于凌逍遥 AI</Text>
          <Text className="menu-arrow">&gt;</Text>
        </View>
        <View className="menu-item">
          <Text className="menu-label">意见反馈</Text>
          <Text className="menu-arrow">&gt;</Text>
        </View>
      </View>

      {/* Logout */}
      {loggedIn && (
        <View className="logout-section">
          <View className="logout-btn" onClick={handleLogout}>
            <Text className="logout-text">退出登录</Text>
          </View>
        </View>
      )}

      {/* Footer */}
      <View className="footer">
        <Text className="footer-text">凌逍遥 AI - 用 AI，做更好的自己</Text>
        <Text className="footer-version">v1.0.0</Text>
      </View>
    </View>
  );
}
