import path from "node:path";
import { BlockNoteEditor } from "@blocknote/core";
import { api } from "@convex/api";
import { ConvexHttpClient } from "convex/browser";
import { projectFields } from "convex/schema";
import dotenv from "dotenv";
import { z } from "zod/v4";
import {
  ensureDom,
  getMarkdownFilesFromPath,
  parseMarkdownFile,
} from "./shared";

ensureDom();

const schema = z
  .object(projectFields)
  .omit({
    content: true,
    lastSyncedAt: true,
  })
  .extend({
    fmContentType: z.literal("projects"),
  });

type ProjectFrontMatter = z.infer<typeof schema>;

type ParsedProject = NonNullable<
  ReturnType<typeof parseMarkdownFile<ProjectFrontMatter>>
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

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

// const _RAW_OUTPUT_DIR = path.join(process.cwd(), "public", "raw");

// Main sync function
async function syncProjects() {
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
  const projects: ParsedProject[] = [];
  for (const filePath of markdownFiles) {
    const project = parseMarkdownFile<ProjectFrontMatter>(filePath, schema);
    if (project) {
      const { content, ...rest } = project;
      const projectContent = editor.tryParseMarkdownToBlocks(content);

      projects.push({ ...rest, content: JSON.stringify(projectContent) });
      console.log(`Parsed: ${project.title} (${project.slug})`);
    }
  }

  console.log(`\nSyncing ${projects.length} posts to Convex...\n`);

  // Sync posts to Convex
  try {
    const result = await client.mutation(api.project.syncProjects, {
      projects,
    });
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

syncProjects().catch(console.error);
