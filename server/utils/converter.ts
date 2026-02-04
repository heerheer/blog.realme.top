/**
 * Converts a string to a boolean if possible.
 * 安全的将字符串转换为布尔值
 * @param value
 * @returns
 */
export function parseBoolean(value: string): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}
