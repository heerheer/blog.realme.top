// 解析 markdown 文件的元数据
function parseMarkdownMetadata(content: string) {
  const metadataRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(metadataRegex);

  if (!match) return null;

  const metadataStr = match[1];
  const metadata: Record<string, any> = {};
  const lines = metadataStr.split("\n");
  let currentKey: string | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // 处理 YAML 列表项格式: "- tag"
    if (trimmedLine.startsWith("-") && currentKey) {
      const value = trimmedLine.slice(1).trim().replace(/['"]/g, "");
      if (!Array.isArray(metadata[currentKey])) {
        metadata[currentKey] = [];
      }
      metadata[currentKey].push(value);
      continue;
    }

    // 处理键值对格式: "key: value"
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const valueString = line.slice(colonIndex + 1).trim();
      currentKey = key;

      if (valueString) {
        // 处理行内数组格式: "[tag1, tag2]"
        if (valueString.startsWith("[") && valueString.endsWith("]")) {
          metadata[key] = valueString
            .slice(1, -1)
            .split(",")
            .map((v) => v.trim().replace(/['"]/g, ""));
        } else {
          metadata[key] = valueString.replace(/['"]/g, "");
        }
      } else {
        // 值为占位，后续可能是列表子项
        metadata[key] = null;
      }
    }
  }

  return metadata;
}

// 计算阅读时间（简单算法：按 200 字/分钟）
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// 生成文章摘要
function generateExcerpt(content: string, maxLength: number = 150): string {
  // 移除元数据部分
  const withoutMetadata = content.replace(/^---\n[\s\S]*?\n---\n/, "");
  // 移除 markdown 标记
  const plainText = withoutMetadata
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*|__/g, "")
    .replace(/\*|_/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();

  return plainText.length > maxLength
    ? plainText.slice(0, maxLength) + "..."
    : plainText;
}

// 生成固定长度的Post ID（基于文件路径的哈希）
async function generatePostId(filePath: string): Promise<string> {
  // 使用 Bun 的 crypto API
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(filePath);
  const hash = hasher.digest("hex");
  
  // 返回前12位作为固定长度ID（足够唯一且简短）
  return hash.substring(0, 12);
}

export { parseMarkdownMetadata, calculateReadTime, generateExcerpt, generatePostId };
