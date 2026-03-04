export default defineAppConfig({
  pages: [
    "pages/index/index",
    "pages/courses/index",
    "pages/course-detail/index",
    "pages/chapter/index",
    "pages/articles/index",
    "pages/article/index",
    "pages/dashboard/index",
    "pages/profile/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "凌逍遥 AI",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#666666",
    selectedColor: "#1677ff",
    backgroundColor: "#ffffff",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
        iconPath: "assets/tab-home.png",
        selectedIconPath: "assets/tab-home-active.png",
      },
      {
        pagePath: "pages/courses/index",
        text: "课程",
        iconPath: "assets/tab-course.png",
        selectedIconPath: "assets/tab-course-active.png",
      },
      {
        pagePath: "pages/dashboard/index",
        text: "学习",
        iconPath: "assets/tab-study.png",
        selectedIconPath: "assets/tab-study-active.png",
      },
      {
        pagePath: "pages/profile/index",
        text: "我的",
        iconPath: "assets/tab-profile.png",
        selectedIconPath: "assets/tab-profile-active.png",
      },
    ],
  },
  darkmode: true,
  themeLocation: "theme.json",
});
