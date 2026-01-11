/** biome-ignore-all lint/performance/useTopLevelRegex: <ignore> */

import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { type ClassValue, clsx } from "clsx";
import matter from "gray-matter";
import { JSDOM } from "jsdom";
import { twMerge } from "tailwind-merge";
import type { z } from "zod/v4";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isRoutePath = (href?: string) => Boolean(href?.startsWith("/"));

export const getDateString = (dateStr: string | Date) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const kebabToTitle = (str: string) =>
  str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const buildPageTitle = (pageTitle: string, siteName?: string) =>
  `${pageTitle} | ${siteName ?? "Jie Wang"}`;

export const isBrowser = typeof window !== "undefined";

export const getMarkdownFilesFromPath = (pathname: string): string[] => {
  if (!existsSync(pathname)) {
    console.log(`Creating content directory: ${pathname}`);
    mkdirSync(pathname, { recursive: true });
    return [];
  }

  const files = readdirSync(pathname);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(pathname, file));
};

export const parseMarkdownFile = <
  T extends { fmContentType: "posts" | "projects" },
>(
  filePath: string,
  frontmatterSchema: z.ZodType<T>
) => {
  try {
    const fileContent = readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const frontmatter = data;

    const parseResult = frontmatterSchema.safeParse(frontmatter);

    if (parseResult.error) {
      console.warn(`Skipping ${filePath}: ${parseResult.error.message}`);
      return;
    }

    const { fmContentType, ...rest } = parseResult.data;

    return {
      ...rest,
      content: content.trim(), // this has to be content
    };
  } catch (e) {
    console.error(`Error parsing ${filePath}:`, e);
    return;
  }
};

export function ensureDom() {
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
