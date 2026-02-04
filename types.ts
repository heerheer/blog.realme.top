import { Type as T, Static } from "@sinclair/typebox";

export const PostSchema = T.Object({
  id: T.String(),
  postPath: T.String(),
  title: T.String(),
  excerpt: T.String(),
  content: T.String(),
  date: T.String(),
  tags: T.Array(T.String()),
  readTime: T.String(),
});

export type Post = Static<typeof PostSchema>;

export const BlogDataSchema = T.Object({
  posts: T.Array(PostSchema),
  availableTags: T.Array(T.String()),
});

export type BlogData = Static<typeof BlogDataSchema>;
