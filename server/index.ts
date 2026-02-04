import { Elysia, status, t } from "elysia";
import { s3client } from "./s3.client";
import { loadBlogCache } from "./blog.cache";
import { BlogDataSchema, PostSchema, type BlogData } from "../types";
import { parseBoolean } from "./utils/converter";

// 初始化时加载缓存
await loadBlogCache();

export const server = new Elysia()
  .use(s3client)
  .decorate("blogCache", loadBlogCache)
  .get(
    "/api/blogs",
    async ({ blogCache, query }) => {
      return await blogCache(parseBoolean(query.force) || false);
    },
    {
      detail: "获取博客列表，支持强制刷新缓存",
      response: BlogDataSchema,
      query: t.Object({ force: t.Optional(t.String()) }),
    },
  )
  .get(
    "/api/blogs/:id",
    async ({ params: { id }, blogCache }) => {
      const data: BlogData = await blogCache();
      const post = data.posts.find((p) => p.id === id);

      if (!post) {
        return status(404, "Post not found");
      }

      return post;
    },
    {
      detail: "根据ID获取单个博客文章",
      params: t.Object({ id: t.String() }),
      response: { 200: PostSchema, 404: t.String() },
    },
  )
  .get(
    "/api/tags",
    async ({ blogCache }) => {
      const data: BlogData = await blogCache();
      return { tags: data.availableTags };
    },
    {
      detail: "获取所有可用的标签",
      response: t.Object({ tags: t.Array(t.String()) }),
    },
  )
  .get(
    "/api/blogs/tag/:tag",
    async ({ params: { tag }, blogCache }) => {
      const data: BlogData = await blogCache();
      const filteredPosts = data.posts.filter((post) =>
        post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
      );

      return { posts: filteredPosts };
    },
    {
      detail: "根据标签获取博客文章",
      params: t.Object({ tag: t.String() }),
      response: t.Object({ posts: t.Array(PostSchema) }),
    },
  );
