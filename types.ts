export interface Post {
  id: string;
  postPath: string; // 原始文件路径
  title: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
  readTime: string;
}

export interface BlogData {
  posts: Post[];
  availableTags: string[];
}
