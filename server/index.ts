import { Elysia } from "elysia";
import { s3client } from "./s3.client";
import { loadBlogCache } from "./blog.cache";
import type { BlogData } from "../types";

// 初始化时加载缓存
await loadBlogCache();

export const server = new Elysia()
  .use(s3client)
  .decorate("blogCache", loadBlogCache)
  .get("/api/blogs", async ({ blogCache }) => {
    const data: BlogData = await blogCache();
    return data;
  })
  .get("/api/blogs/:id", async ({ params: { id }, blogCache }) => {
    const data: BlogData = await blogCache();
    const post = data.posts.find(p => p.id === id);
    
    if (!post) {
      return new Response("Post not found", { status: 404 });
    }
    
    return post;
  })
  .get("/api/tags", async ({ blogCache }) => {
    const data: BlogData = await blogCache();
    return { tags: data.availableTags };
  })
  .get("/api/blogs/tag/:tag", async ({ params: { tag }, blogCache }) => {
    const data: BlogData = await blogCache();
    const filteredPosts = data.posts.filter(post => 
      post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
    
    return { posts: filteredPosts };
  });
