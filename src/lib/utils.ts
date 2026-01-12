/** biome-ignore-all lint/performance/useTopLevelRegex: <ignore> */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
