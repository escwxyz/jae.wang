import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { BlockNoteEditor } from "@blocknote/core";
import { api } from "@convex/api";

import { ConvexHttpClient } from "convex/browser";
import { postFields } from "convex/schema";
import dotenv from "dotenv";
import matter from "gray-matter";
import { JSDOM } from "jsdom";
import { z } from "zod/v4";

const dateTimeField = z.preprocess((value) => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}, z.iso.datetime());

const schema = z
  .object(postFields)
  .omit({
    content: true,
    coverImageKey: true,
    lastSyncedAt: true,
  })
  .extend({
    date: dateTimeField,
    lastmod: dateTimeField,
    fmContentType: z.literal("posts"),
  });

type PostFrontMatter = z.infer<typeof schema>;

type ParsedPost = NonNullable<ReturnType<typeof parseMarkdownFile>>;

const isProduction = process.env.SYNC_ENV === "production";

if (isProduction) {
  // Production: load .env.production.local first
  dotenv.config({ path: ".env.production.local" });
  console.log("Syncing to PRODUCTION deployment...\n");
} else {
  // Development: load .env.local
  dotenv.config({ path: ".env.local" });
}
dotenv.config();

const CONTENT_DIR = path.join(process.cwd(), "content", "posts");

// const _RAW_OUTPUT_DIR = path.join(process.cwd(), "public", "raw");

function ensureDom() {
  if (globalThis.document) {
    return;
  }

  const { window } = new JSDOM("<!doctype html><html><body></body></html>");
  const globalForDom = globalThis as typeof globalThis & {
    window: Window;
    document: Document;
    Node: typeof Node;
    Element: typeof Element;
    HTMLElement: typeof HTMLElement;
    Document: typeof Document;
  };

  globalForDom.document = window.document;
  globalForDom.Node = window.Node;
  globalForDom.Element = window.Element;
  globalForDom.HTMLElement = window.HTMLElement;
  globalForDom.Document = window.Document;
}

function parseMarkdownFile(filePath: string) {
  try {
    const fileContent = readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const frontmatter = data as PostFrontMatter;

    const parseResult = schema.safeParse(frontmatter);

    if (parseResult.error) {
      console.warn(`Skipping ${filePath}: ${parseResult.error.message}`);
      return;
    }

    const { fmContentType, ...rest } = parseResult.data;

    return {
      ...rest,
      content: content.trim(),
    };
  } catch (e) {
    console.error(`Error parsing ${filePath}:`, e);
    return;
  }
}

// Get all markdown files from the content directory
function getAllMarkdownFiles(): string[] {
  if (!existsSync(CONTENT_DIR)) {
    console.log(`Creating content directory: ${CONTENT_DIR}`);
    mkdirSync(CONTENT_DIR, { recursive: true });
    return [];
  }

  const files = readdirSync(CONTENT_DIR);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(CONTENT_DIR, file));
}

// Main sync function
async function syncPosts() {
  console.log("Starting post sync...\n");

  // Get Convex URL from environment
  const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) {
    console.error(
      "Error: VITE_CONVEX_URL or CONVEX_URL environment variable is not set"
    );
    process.exit(1);
  }

  // Initialize Convex client
  const client = new ConvexHttpClient(convexUrl);

  ensureDom();

  const editor = BlockNoteEditor.create();

  // Get all markdown files
  const markdownFiles = getAllMarkdownFiles();
  console.log(`Found ${markdownFiles.length} markdown files\n`);

  if (markdownFiles.length === 0) {
    console.log("No markdown files found. Stopping...");

    return;
  }

  // Parse all markdown files
  const posts: ParsedPost[] = [];
  for (const filePath of markdownFiles) {
    const post = parseMarkdownFile(filePath);
    if (post) {
      const { content, ...rest } = post;
      const postContent = editor.tryParseMarkdownToBlocks(content);

      posts.push({ ...rest, content: JSON.stringify(postContent) });
      console.log(`Parsed: ${post.title} (${post.slug})`);
    }
  }

  console.log(`\nSyncing ${posts.length} posts to Convex...\n`);

  // Sync posts to Convex
  try {
    const result = await client.mutation(api.post.syncPosts, { posts });
    console.log("Sync complete!");
    console.log(`  Created: ${result.created}`);
    console.log(`  Updated: ${result.updated}`);
    console.log(`  Deleted: ${result.deleted}`);
  } catch (error) {
    console.error("Error syncing posts:", error);
    process.exit(1);
  }

  // TODO: upload to r2 for RAG

  // Generate static raw markdown files in public/raw/
  //   generateRawMarkdownFiles(posts, pages);
}

// Generate static markdown file in public/raw/ directory
// function generateRawMarkdownFile(
//   slug: string,
//   title: string,
//   description: string,
//   content: string,
//   date: string,
//   tags: string[],
//   readTime?: string,
//   type: "post" | "page" = "post"
// ): void {
//   // Ensure raw output directory exists
//   if (!existsSync(RAW_OUTPUT_DIR)) {
//     mkdirSync(RAW_OUTPUT_DIR, { recursive: true });
//   }

//   // Build metadata section
//   const metadataLines: string[] = [];
//   metadataLines.push(`Type: ${type}`);
//   metadataLines.push(`Date: ${date}`);
//   if (readTime) { metadataLines.push(`Reading time: ${readTime}`); }
//   if (tags && tags.length > 0) { metadataLines.push(`Tags: ${tags.join(", ")}`); }

//   // Build the full markdown document
//   let markdown = `# ${title}\n\n`;

//   // Add description if available
//   if (description) {
//     markdown += `> ${description}\n\n`;
//   }

//   // Add metadata block
//   markdown += `---\n${metadataLines.join("\n")}\n---\n\n`;

//   // Add main content
//   markdown += content;

//   // Write to file
//   const filePath = path.join(RAW_OUTPUT_DIR, `${slug}.md`);
//   writeFileSync(filePath, markdown);
// }

// function generateRawMarkdownFiles(
//   posts: ParsedPost[],
// ): void {
//   console.log("\nGenerating static markdown files in public/raw/...");

//   // Clear existing raw files
//   if (existsSync(RAW_OUTPUT_DIR)) {
//     const existingFiles = readdirSync(RAW_OUTPUT_DIR);
//     for (const file of existingFiles) {
//       if (file.endsWith(".md")) {
//         unlinkSync(path.join(RAW_OUTPUT_DIR, file));
//       }
//     }
//   }

//   // Generate files for published posts
//   const publishedPosts = posts.filter((p) => p.published);
//   for (const post of publishedPosts) {
//     generateRawMarkdownFile(
//       post.slug,
//       post.title,
//       post.description,
//       post.content,
//       post.publishedAt,
//       post.tags,
//       post.readTime,
//       "post"
//     );
//   }

//   // Generate files for published pages
//   const publishedPages = pages.filter((p) => p.published);
//   for (const page of publishedPages) {
//     generateRawMarkdownFile(
//       page.slug,
//       page.title,
//       "", // pages don't have description
//       page.content,
//       new Date().toISOString().split("T")[0], // pages don't have date
//       [], // pages don't have tags
//       undefined,
//       "page"
//     );
//   }

//   console.log(
//     `Generated ${publishedPosts.length} post files, ${publishedPages.length} page files, and 1 index file`
//   );
// }

syncPosts().catch(console.error);
