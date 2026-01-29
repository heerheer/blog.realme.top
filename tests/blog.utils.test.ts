import { describe, it, expect } from "bun:test";
import {
  parseMarkdownMetadata,
  calculateReadTime,
  generateExcerpt,
} from "../server/blog.utils";

describe("parseMarkdownMetadata", () => {
  it("should parse valid markdown metadata with title and tags", () => {
    const content = `---
title: Test Post
date: 2024-01-01
tags: 
  - blog
  - test
  - example
---
# Content here`;

    const metadata = parseMarkdownMetadata(content);

    expect(metadata).not.toBeNull();
    expect(metadata?.title).toBe("Test Post");
    expect(metadata?.date).toBe("2024-01-01");
    expect(metadata?.tags).toEqual(["blog", "test", "example"]);
  });

  it("should parse metadata with quoted array values", () => {
    const content = `---
title: Another Post
tags:
  - javascript
  - typescript
  - blog
---
Content`;

    const metadata = parseMarkdownMetadata(content);

    expect(metadata).not.toBeNull();
    expect(metadata?.tags).toEqual(["javascript", "typescript", "blog"]);
  });

  it("should parse metadata with single quoted values", () => {
    const content = `---
title: 'Post with Quotes'
author: 'John Doe'
tags: ['blog', 'coding']
---
Content`;

    const metadata = parseMarkdownMetadata(content);

    expect(metadata).not.toBeNull();
    expect(metadata?.title).toBe("Post with Quotes");
    expect(metadata?.author).toBe("John Doe");
    expect(metadata?.tags).toEqual(["blog", "coding"]);
  });

  it("should handle metadata with colons in values", () => {
    const content = `---
title: Test: A Guide
url: https://example.com
---
Content`;

    const metadata = parseMarkdownMetadata(content);

    expect(metadata).not.toBeNull();
    expect(metadata?.title).toBe("Test: A Guide");
    expect(metadata?.url).toBe("https://example.com");
  });

  it("should return null for content without metadata", () => {
    const content = `# Just a heading
No metadata here`;

    const metadata = parseMarkdownMetadata(content);

    expect(metadata).toBeNull();
  });

  it("should return null for empty content", () => {
    const metadata = parseMarkdownMetadata("");
    expect(metadata).toBeNull();
  });
});

describe("calculateReadTime", () => {
  it("should calculate read time for short content", () => {
    const content = "a".repeat(200); // 200 characters = 1 min
    const readTime = calculateReadTime(content);

    expect(readTime).toBe("1 min read");
  });

  it("should calculate read time for medium content", () => {
    const content = "a".repeat(1000); // 1000 characters = 5 min
    const readTime = calculateReadTime(content);

    expect(readTime).toBe("5 min read");
  });

  it("should calculate read time for long content", () => {
    const content = "a".repeat(2200); // 2200 characters = 11 min
    const readTime = calculateReadTime(content);

    expect(readTime).toBe("11 min read");
  });

  it("should handle empty content", () => {
    const readTime = calculateReadTime("");
    expect(readTime).toBe("0 min read");
  });

  it("should round up partial minutes", () => {
    const content = "a".repeat(250); // 250 characters, should round up to 2 min
    const readTime = calculateReadTime(content);

    expect(readTime).toBe("2 min read");
  });
});

describe("generateExcerpt", () => {
  it("should generate excerpt from plain text", () => {
    const content = `---
title: Test
---
This is a simple paragraph that should be used as an excerpt.`;

    const excerpt = generateExcerpt(content, 30);

    expect(excerpt).toBe("This is a simple paragraph tha...");
  });

  it("should remove markdown headers", () => {
    const content = `---
title: Test
---
# Main Heading
## Subheading
This is the content.`;

    const excerpt = generateExcerpt(content, 50);

    expect(excerpt).toContain("Main Heading");
    expect(excerpt).toContain("Subheading");
    expect(excerpt).not.toContain("#");
  });

  it("should remove markdown bold and italic formatting", () => {
    const content = `---
title: Test
---
This is **bold** and *italic* text.`;

    const excerpt = generateExcerpt(content, 100);

    expect(excerpt).toBe("This is bold and italic text.");
    expect(excerpt).not.toContain("**");
    expect(excerpt).not.toContain("*");
  });

  it("should remove markdown links but keep link text", () => {
    const content = `---
title: Test
---
Check out [this link](https://example.com) for more info.`;

    const excerpt = generateExcerpt(content, 100);

    expect(excerpt).toContain("this link");
    expect(excerpt).not.toContain("](");
    expect(excerpt).not.toContain("https://");
  });

  it("should truncate long content with default length", () => {
    const content = `---
title: Test
---
${"This is a very long sentence. ".repeat(20)}`;

    const excerpt = generateExcerpt(content);

    expect(excerpt.length).toBeLessThanOrEqual(153); // 150 + "..."
    expect(excerpt).toEndWith("...");
  });

  it("should not truncate short content", () => {
    const content = `---
title: Test
---
Short content.`;

    const excerpt = generateExcerpt(content, 100);

    expect(excerpt).toBe("Short content.");
    expect(excerpt).not.toEndWith("...");
  });

  it("should handle content with multiple markdown elements", () => {
    const content = `---
title: Complex Test
tags: [blog, test]
---
# Introduction

This is **important** text with a [link](https://example.com) and *emphasis*.

## More content
Additional paragraph here.`;

    const excerpt = generateExcerpt(content, 80);

    expect(excerpt).not.toContain("#");
    expect(excerpt).not.toContain("**");
    expect(excerpt).not.toContain("*");
    expect(excerpt).not.toContain("[");
    expect(excerpt).not.toContain("](");
    expect(excerpt.length).toBeLessThanOrEqual(83);
  });

  it("should remove metadata before processing", () => {
    const content = `---
title: Test Post
author: John Doe
tags: [blog, test]
---
Actual content starts here.`;

    const excerpt = generateExcerpt(content, 100);

    expect(excerpt).toBe("Actual content starts here.");
    expect(excerpt).not.toContain("title:");
    expect(excerpt).not.toContain("---");
  });
});
