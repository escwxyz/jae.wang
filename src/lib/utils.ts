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

// interface ShaderControl {
//   type: string;
//   name: string;
//   controls: ReturnType<typeof useControls>;
// }

// export function extractLevaControls(
//   vert: string,
//   frag: string
// ): Record<string, unknown> {
//   const controls: ShaderControl[] = `
//     ${vert}
//     ${frag}
//   `
//     .split("\n")
//     .filter((x) => x.indexOf("uniform") > -1)
//     .map((x) => x.match(/uniform (.+?) (.+?);.+(\/\/.+)/m))
//     .filter((x) => x)
//     .map((match) => {
//       if (!(match?.[1] && match[2] && match[3])) {
//         throw new Error("makeControls: regex match failed");
//       }

//       return {
//         type: match[1],
//         name: match[2],
//         controls: JSON.parse(match[3].replace("// ", "")) as ReturnType<
//           typeof useControls
//         >,
//       };
//     });

//   return controls.reduce<Record<string, unknown>>((acc, control) => {
//     acc[control.name] = control.controls;
//     return acc;
//   }, {});
// }
