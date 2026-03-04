// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  wechatOpenId?: string;
  wechatUnionId?: string;
  miniProgramOpenId?: string;
  nickname: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  nickname: string;
  iat: number;
  exp: number;
}

// ─── Course & Chapter ────────────────────────────────────────────────────────

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number; // in cents (分)
  coverUrl?: string;
  totalChapters: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  courseId: string;
  index: number;
  title: string;
  videoId: string; // Tencent VOD FileId
  isFree: boolean;
  duration: number; // minutes
  createdAt: Date;
}

// ─── Article ─────────────────────────────────────────────────────────────────

export interface ArticleFrontmatter {
  title: string;
  date: string;
  tags: string[];
  series?: string;
  isFree: boolean;
  summary: string;
  coverUrl?: string;
}

export interface Article extends ArticleFrontmatter {
  slug: string;
  readingTime: number; // minutes
}

// ─── Doc ─────────────────────────────────────────────────────────────────────

export interface DocFrontmatter {
  title: string;
  description?: string;
  order?: number;
}

export interface Doc extends DocFrontmatter {
  slug: string[];
}

// ─── Chapter MDX ─────────────────────────────────────────────────────────────

export interface ChapterFrontmatter {
  title: string;
  courseSlug: string;
  chapterIndex: number;
  videoId: string;
  isFree: boolean;
  duration: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: string;
  userId: string;
  courseId: string;
  status: OrderStatus;
  amount: number; // in cents (分)
  alipayTradeNo?: string;
  wechatPayTradeNo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Comment ─────────────────────────────────────────────────────────────────

export type ContentType = "article" | "doc" | "chapter";

export interface Comment {
  id: string;
  userId: string;
  user: Pick<User, "nickname" | "avatarUrl">;
  contentType: ContentType;
  contentSlug: string;
  parentId?: string;
  body: string;
  createdAt: Date;
  isDeleted: boolean;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface UserProgress {
  id: string;
  userId: string;
  contentType: ContentType;
  contentSlug: string;
  completedAt: Date;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export type SearchResultType = "article" | "doc" | "course" | "chapter";

export interface SearchResult {
  type: SearchResultType;
  title: string;
  summary: string;
  slug: string;
  url: string;
}

export interface SearchIndex {
  id: string;
  type: SearchResultType;
  title: string;
  content: string;
  summary: string;
  url: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
