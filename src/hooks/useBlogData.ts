import { useQuery } from '@tanstack/react-query';
import { fetchBlogPosts, fetchPostById } from '../services/blogService';

// 获取所有博客数据的 hook
export const useBlogData = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: fetchBlogPosts,
    staleTime: 5 * 60 * 1000, // 5分钟内认为数据是新鲜的
    gcTime: 10 * 60 * 1000, // 缓存10分钟
    refetchOnWindowFocus: true, // 窗口重新获得焦点时刷新
  });
};

// 根据ID获取单个帖子的 hook
export const usePost = (id: string | undefined) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => {
      if (!id) throw new Error('Post ID is required');
      return fetchPostById(id);
    },
    enabled: !!id, // 只有当ID存在时才执行查询
    staleTime: 10 * 60 * 1000, // 10分钟内认为数据是新鲜的
    gcTime: 15 * 60 * 1000, // 缓存15分钟
    retry: 1, // 失败后重试1次
  });
};
