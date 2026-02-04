# React Query 优化说明

## 实现概述

已成功将博客的数据获取逻辑重构为使用 **@tanstack/react-query** (React Query v5)，显著提升了应用的性能和用户体验。

## 主要改进

### 1. 自动缓存管理

- **博客列表**：缓存5分钟，避免重复请求
- **单个帖子**：缓存10分钟，减少服务器负载
- **垃圾回收**：自动清理过期缓存

### 2. 智能请求优化

- **请求去重**：同时多个组件请求相同数据时只发送一次请求
- **后台刷新**：数据过期后在后台自动刷新，用户无感知
- **自动重试**：失败请求自动重试1次

### 3. 更好的状态管理

- 统一的 `isLoading`、`isError` 状态
- 不再需要手动管理 useState/useEffect
- 代码更简洁、更易维护

### 4. 性能提升

- 减少不必要的网络请求
- 降低服务器压力
- 提升页面响应速度
- 更好的用户体验（无loading闪烁）

## 代码结构

```
src/
├── hooks/
│   └── useBlogData.ts          # React Query hooks
├── services/
│   └── blogService.ts          # API调用函数（保持不变）
├── pages/
│   ├── HomePage.tsx            # 使用 useBlogData()
│   └── PostPage.tsx            # 使用 usePost(id)
└── App.tsx                     # QueryClientProvider配置
```

## 使用示例

### 获取博客列表

```tsx
const { data, isLoading, isError } = useBlogData();

// data 自动缓存，5分钟内不会重复请求
// isLoading 自动管理加载状态
// isError 自动管理错误状态
```

### 获取单个帖子

```tsx
const { data: post, isLoading, isError } = usePost(id);

// 根据ID获取帖子
// 自动缓存10分钟
// ID改变时自动重新请求
```

## 配置参数

### QueryClient 全局配置

```typescript
{
  refetchOnWindowFocus: false,  // 窗口重新获得焦点时不自动刷新
  retry: 1,                     // 失败后重试1次
  staleTime: 5 * 60 * 1000,    // 5分钟内认为数据是新鲜的
}
```

### Hook 级别配置

- **useBlogData**: staleTime=5分钟, gcTime=10分钟
- **usePost**: staleTime=10分钟, gcTime=15分钟, enabled=!!id

## 性能对比

### 优化前

```tsx
// 每次组件渲染都需要 useState + useEffect
// 手动管理 loading/error 状态
// 无缓存，每次都重新请求
// 代码冗长，容易出错
```

### 优化后

```tsx
// 一行代码获取数据和状态
// 自动缓存和状态管理
// 智能请求优化
// 代码简洁，易于维护
```

## 优势总结

✅ **性能提升**：缓存机制减少网络请求  
✅ **代码简化**：无需手动管理状态  
✅ **用户体验**：更快的响应速度  
✅ **可维护性**：统一的数据获取模式  
✅ **可扩展性**：易于添加新的查询

## 未来扩展

可以进一步添加：

- 乐观更新（Optimistic Updates）
- 无限滚动（Infinite Queries）
- 预取数据（Prefetching）
- 查询失效和重新验证
- 离线支持

## 参考资源

- [TanStack Query 文档](https://tanstack.com/query/latest)
- [React Query 最佳实践](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
