import { BlogData, Post } from "@/types";

export const fetchBlogPosts = async (): Promise<BlogData> => {
  try {
    const response = await fetch("/api/blogs");

    if (!response.ok) {
      throw new Error(`Failed to fetch blog posts: ${response.statusText}`);
    }

    const data: BlogData = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    throw error;
  }
};

export const fetchPostById = async (id: string): Promise<Post | null> => {
  try {
    const response = await fetch(`/api/blogs/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const post: Post = await response.json();
    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};
