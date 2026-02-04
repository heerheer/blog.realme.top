# Posts路由功能说明

## 功能概述

现在前端支持通过 `/posts/:id` 路由直接访问特定的博客帖子。

## 实现细节

### 1. ID生成机制

- 帖子ID由文件路径生成（基于SHA-256哈希的前12位）
- ID长度固定为12个字符，确保唯一性和简洁性
- 原始路径保存在 `post.postPath` 字段中

### 2. 新增字段

在 `types.ts` 中的 `Post` 接口新增了：

```typescript
postPath: string; // 原始文件路径（不含.md扩展名）
```

### 3. 路由结构

- `/` - 主页，显示所有帖子列表
- `/posts/:id` - 单个帖子页面

### 4. 使用示例

假设有一个文件 `日记/2026-02-03.md`，其生成的ID可能是 `a1b2c3d4e5f6`

访问方式：

- 直接URL访问：`https://example.com/posts/a1b2c3d4e5f6`
- 从主页点击帖子，URL会自动更新为 `/posts/:id`

### 5. API端点

后端提供以下API：

- `GET /api/blogs` - 获取所有帖子
- `GET /api/blogs/:id` - 根据ID获取单个帖子

### 6. 功能特点

- 支持直接通过URL访问特定帖子
- ID基于路径哈希，即使文件移动也能保持一致性（只要路径不变）
- 404页面处理：当帖子不存在时显示友好的错误页面
- 保持overlay式阅读体验

## 技术栈

- React Router v7 - 客户端路由
- SHA-256 哈希 - ID生成
- Bun CryptoHasher - 哈希实现
