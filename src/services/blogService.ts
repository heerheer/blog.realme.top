import { BlogData } from "@/types";

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
