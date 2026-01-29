import { listMarkdownKeys, readMarkdown } from "./s3.reader";
import type { Post, BlogData } from "../types";
import {
  parseMarkdownMetadata,
  calculateReadTime,
  generateExcerpt,
} from "./blog.utils";

// 缓存的博客数据
let cachedBlogData: BlogData | null = null;
let lastCacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟缓存

// 加载并缓存博客数据
export async function loadBlogCache(): Promise<BlogData> {
  const now = Date.now();

  // 如果缓存有效，直接返回
  if (cachedBlogData && now - lastCacheTime < CACHE_TTL) {
    return cachedBlogData;
  }

  console.log("Loading blog data from S3...");

  const markdownFiles = await listMarkdownKeys();
  console.log("Loaded markdown file list:", markdownFiles.length);

  const posts: Post[] = [];
  const allTags = new Set<string>();

  if (markdownFiles) {
    for (const file of markdownFiles) {
      if (!file.key) continue;

      try {
        const content = await readMarkdown(file.key);
        const metadata = parseMarkdownMetadata(content);

        // 检查是否包含 "blog" 标签
        if (metadata && metadata.tags && Array.isArray(metadata.tags)) {
          const tags = metadata.tags.map((t) => String(t).toLowerCase());

          if (tags.includes("blog")) {
            // 移除元数据部分后的内容
            const contentWithoutMetadata = content.replace(
              /^---\n[\s\S]*?\n---\n/,
              "",
            );

            const post: Post = {
              id: file.key.replace(".md", ""),
              title: metadata.title || file.key,
              excerpt: generateExcerpt(content),
              content: contentWithoutMetadata,
              date: metadata.date || new Date().toISOString(),
              tags: metadata.tags || [],
              readTime: calculateReadTime(contentWithoutMetadata),
            };

            posts.push(post);

            // 收集所有标签
            metadata.tags.forEach((tag: string) => allTags.add(tag));
          }
        }
      } catch (error) {
        console.error(`Error processing ${file.key}:`, error);
      }
    }
  }

  // 按日期排序（最新的在前）
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  cachedBlogData = {
    posts,
    availableTags: Array.from(allTags),
  };

  lastCacheTime = now;

  console.log(
    `Loaded ${posts.length} blog posts with ${allTags.size} unique tags`,
  );

  return cachedBlogData;
}

// 获取缓存的博客数据（不刷新）
export function getBlogCache(): BlogData | null {
  return cachedBlogData;
}

// 手动刷新缓存
export async function refreshBlogCache(): Promise<BlogData> {
  lastCacheTime = 0; // 强制刷新
  return await loadBlogCache();
}
