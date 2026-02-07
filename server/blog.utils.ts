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

function normalizeS3BaseUrl(): string | null {
  const endpoint = Bun.env.S3_ENDPOINT;
  const bucket = Bun.env.S3_BUCKET || "blogs";

  if (!endpoint) return null;

  const withScheme = /^https?:\/\//.test(endpoint)
    ? endpoint
    : `https://${endpoint}`;

  return `${withScheme.replace(/\/+$/, "")}/${bucket}`;
}

function resolveObsidianImageUrl(rawPath: string): string {
  const trimmed = rawPath.trim();
  if (/^(https?:)?\/\//.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }

  const base = normalizeS3BaseUrl();
  if (!base) return trimmed;

  const cleanPath = trimmed.replace(/^\.\/?/, "");
  const encodedPath = cleanPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/${encodedPath}`;
}

function parseObsidianTarget(raw: string): {
  path: string;
  alias?: string;
  anchor?: string;
} {
  const [pathPart, aliasPart] = raw.split("|");
  const [path, anchor] = pathPart.split("#");
  return {
    path: path.trim(),
    alias: aliasPart?.trim() || undefined,
    anchor: anchor?.trim() || undefined,
  };
}

async function replaceAsync(
  input: string,
  regex: RegExp,
  replacer: (match: string, ...groups: string[]) => Promise<string>,
): Promise<string> {
  const matches = [...input.matchAll(regex)];
  if (matches.length === 0) return input;

  const replacements = await Promise.all(
    matches.map((match) => replacer(match[0], ...(match.slice(1) as string[]))),
  );

  let result = "";
  let lastIndex = 0;
  matches.forEach((match, index) => {
    const matchIndex = match.index ?? 0;
    result += input.slice(lastIndex, matchIndex);
    result += replacements[index];
    lastIndex = matchIndex + match[0].length;
  });
  result += input.slice(lastIndex);
  return result;
}

// 处理 Obsidian 的 [[链接]] 与 ![[图片]] 语法
async function transformObsidianLinks(content: string): Promise<string> {
  let transformed = content;

  // 处理图片语法 ![[path]] => ![alt](url)
  transformed = await replaceAsync(
    transformed,
    /!\[\[([^\]]+)\]\]/g,
    async (_match, inner) => {
      const { path, alias } = parseObsidianTarget(inner);
      const alt = alias || path.split("/").pop() || path;
      const url = resolveObsidianImageUrl(path);
      return `![${alt}](${url})`;
    },
  );

  // 处理引用语法 [[note]] => [note](/posts/:id)
  transformed = await replaceAsync(
    transformed,
    /\[\[([^\]]+)\]\]/g,
    async (_match, inner) => {
      const { path, alias, anchor } = parseObsidianTarget(inner);
      const normalizedPath = path.replace(/\.md$/i, "");
      const display = alias || normalizedPath.split("/").pop() || normalizedPath;
      const postId = await generatePostId(normalizedPath);
      const hash = anchor ? `#${encodeURIComponent(anchor)}` : "";
      return `[${display}](/posts/${postId}${hash})`;
    },
  );

  return transformed;
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

export {
  parseMarkdownMetadata,
  calculateReadTime,
  generateExcerpt,
  transformObsidianLinks,
  generatePostId,
};
