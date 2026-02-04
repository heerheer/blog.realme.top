import { listMarkdownKeys, readMarkdown } from "./s3.reader";
import type { Post, BlogData } from "../types";
import {
  parseMarkdownMetadata,
  calculateReadTime,
  generateExcerpt,
  generatePostId,
} from "./blog.utils";

// 缓存的博客数据
let cachedBlogData: BlogData | null = null;
let lastCacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟缓存

// 内部持久化缓存，用于增量更新
// Key -> { lastModified, post }
const postsInternalCache = new Map<
  string,
  { lastModified: number; post: Post }
>();

// 加载并缓存博客数据
export async function loadBlogCache(force: boolean = false): Promise<BlogData> {
  const now = Date.now();

  // 如果缓存有效，直接返回
  if (!force && cachedBlogData && now - lastCacheTime < CACHE_TTL) {
    return cachedBlogData;
  }

  console.log("Checking S3 for blog updates...");

  const markdownFiles = await listMarkdownKeys();
  if (!markdownFiles) {
    return (
      cachedBlogData || {
        posts: [],
        availableTags: [],
      }
    );
  }

  console.log("Loaded markdown file list:", markdownFiles.length);

  const currentS3Keys = new Set<string>();
  let hasChanges = false;

  // 1. 找出当前 S3 中的所有 key
  for (const file of markdownFiles) {
    if (file.key) currentS3Keys.add(file.key);
  }

  // 2. 移除已被删除的文件
  for (const key of postsInternalCache.keys()) {
    if (!currentS3Keys.has(key)) {
      console.log(`Removing deleted post: ${key}`);
      postsInternalCache.delete(key);
      hasChanges = true;
    }
  }

  // 3. 处理新增或修改的文件
  for (const file of markdownFiles) {
    if (!file.key) continue;

    const s3LastModified = file.lastModified
      ? new Date(file.lastModified).getTime()
      : 0;
    const cached = postsInternalCache.get(file.key);

    // 如果不存在或者修改时间不一致，则重新抓取并解析
    if (!cached || cached.lastModified !== s3LastModified) {
      try {
        console.log(
          `Fetching ${cached ? "modified" : "new"} file: ${file.key}`,
        );
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

            const postPath = file.key.replace(".md", "");
            const postId = await generatePostId(postPath);

            const post: Post = {
              id: postId,
              postPath: postPath,
              title: metadata.title || file.key,
              excerpt: generateExcerpt(content),
              content: contentWithoutMetadata,
              date: metadata.date || new Date().toISOString(),
              tags: metadata.tags || [],
              readTime: calculateReadTime(contentWithoutMetadata),
            };

            postsInternalCache.set(file.key, {
              lastModified: s3LastModified,
              post,
            });
            hasChanges = true;
          } else if (cached) {
            // 如果原本在缓存中但现在没有 "blog" 标签了，也移除
            postsInternalCache.delete(file.key);
            hasChanges = true;
          }
        } else if (cached) {
          // 解析失败且原本在缓存中，也移除
          postsInternalCache.delete(file.key);
          hasChanges = true;
        }
      } catch (error) {
        console.error(`Error processing ${file.key}:`, error);
      }
    }
  }

  // 4. 如果有任何变化，重新生成的最终博客数据
  const posts: Post[] = Array.from(postsInternalCache.values()).map(
    (v) => v.post,
  );
  const allTags = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => allTags.add(tag)));

  // 按日期排序（最新的在前）
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  cachedBlogData = {
    posts,
    availableTags: Array.from(allTags),
  };

  lastCacheTime = now;

  console.log(
    `Cache updated. Total: ${posts.length} posts, ${allTags.size} tags. ${
      hasChanges ? "Changes applied." : "No changes detected."
    }`,
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
