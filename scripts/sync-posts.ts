import path from "node:path";
import { BlockNoteEditor } from "@blocknote/core";
import { api } from "@convex/api";
import { ConvexHttpClient } from "convex/browser";
import { postFields } from "convex/schema";
import dotenv from "dotenv";
import { z } from "zod/v4";
import {
  ensureDom,
  getMarkdownFilesFromPath,
  parseMarkdownFile,
} from "./shared";

ensureDom();

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

type ParsedPost = NonNullable<
  ReturnType<typeof parseMarkdownFile<PostFrontMatter>>
>;

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
  const markdownFiles = getMarkdownFilesFromPath(CONTENT_DIR);
  console.log(`Found ${markdownFiles.length} markdown files\n`);

  if (markdownFiles.length === 0) {
    console.log("No markdown files found. Stopping...");

    return;
  }

  // Parse all markdown files
  const posts: ParsedPost[] = [];
  for (const filePath of markdownFiles) {
    const post = parseMarkdownFile<PostFrontMatter>(filePath, schema);
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

syncPosts().catch(console.error);
