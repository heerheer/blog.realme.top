import { s3 } from "./s3.client";

export async function listMarkdownKeys() {
  const list = await s3.list();
  return list.contents?.filter((item) => item.key?.endsWith(".md"));
}

export async function readMarkdown(key: string) {
  return await s3.file(key).text();
}
