export interface Post {
  id: string;
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
