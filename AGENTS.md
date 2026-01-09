# TanStack Start + Ultracite Code Standards

This project uses **TanStack Start** with **React 19**, **Convex** for the backend, and **Ultracite** for code quality. All agents must follow these standards strictly.

---

## Development Commands

### Essential Commands (Use These)

- **Start development**: `pnpm run dev` (starts Vite dev server on port 3000 + Convex backend)
- **Build for production**: `pnpm run build` (Vite production build)
- **Deploy**: `pnpm run deploy` (build + wrangler deploy to Cloudflare)
- **Fix all issues**: `pnpm dlx ultracite fix` (format + lint fixes)

### Code Quality Commands

- **Check everything**: `pnpm run check` (Biome check)
- **Lint only**: `pnpm run lint` (Biome lint)
- **Format only**: `pnpm run format` (Biome format)

### Testing (When Added)

- **Run all tests**: `npx vitest` (when tests exist)
- **Run single test**: `npx vitest path/to/file.test.ts`
- **Run specific test**: `npx vitest -t "test name"`

---

## Project Architecture

### Tech Stack

- **Frontend**: React 19 + TanStack Start + TanStack Router + Tailwind CSS 4
- **Backend**: Convex (serverless functions + database)
- **Auth**: Better Auth with Convex integration
- **Styling**: Tailwind CSS + Base UI + class-variance-authority
- **Deployment**: Cloudflare Workers/Pages
- **Package Manager**: pnpm (required)

### Path Aliases

- `@/*` → `./src/*` (frontend code)
- `@convex/*` → `./convex/_generated/*` (generated Convex types)

---

## Coding Standards

### Import Patterns

```typescript
// Group imports: external libs first, then internal @/ imports
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@base-ui/react/button";
import * as React from "react";

import { ComponentExample } from "@/components/component-example";
import { cn } from "@/lib/utils";
```

### Component Patterns

- Use `function ComponentName() {}` (not arrow functions for main components)
- Export sub-components from same file: `Card`, `CardHeader`, `CardTitle`
- Use `data-slot="name"` on container elements
- Use `cn()` utility for className merging
- Prefer `render={<Button />}` pattern for UI triggers

### TypeScript Conventions

- Use `type` for component props and variants
- Use `interface` only when extensibility is needed
- Use `as const` for literal arrays and objects
- Prefer `React.ComponentProps<"tag">` for spreading HTML attributes
- Use `unknown` over `any` when genuinely unknown

### Naming Conventions

- **Files**: kebab-case (`alert-dialog.tsx`, `auth-client.ts`)
- **Components**: PascalCase (`ComponentExample`, `CardWrapper`)
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE for magic numbers/strings

### Styling Guidelines

- Use Tailwind utility classes exclusively
- Use CVA (`class-variance-authority`) for component variants
- Use semantic HTML with proper ARIA attributes
- Add `rel="noopener"` for `target="_blank"` links
- Prefer `className` prop over inline styles

### Error Handling

- Throw `Error` objects with descriptive messages
- Use `async/await` with `try-catch` blocks
- Use early returns to minimize nesting
- Remove `console.log` and `debugger` before committing

### React Specific Rules

- Call hooks at top level only (never conditionally)
- Specify all dependencies in hook arrays correctly
- Use `key` prop with unique IDs (not array indices)
- Use semantic elements (`<button>`, `<nav>`) over divs with roles

---

## Convex Backend Patterns

### Schema Definition

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }).index("email", ["email"]),
});
```

### Auth Integration

```typescript
import { getAuth } from "@convex-dev/auth";
import { mutation, query } from "./_generated/server";

export const someQuery = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const auth = getAuth(ctx);
    // auth session available here
  },
});
```

---

## Before Committing

1. Run `pnpm dlx ultracite fix` (auto-fixes all issues)
2. Run `pnpm run check` (verify no remaining issues)
3. Run `pnpm run build` (ensure production build works)
4. Test your changes manually in the dev server

---

## Security & Performance

- Validate all user input with Convex validators
- Use `rel="noopener"` on external links
- Avoid `dangerouslySetInnerHTML`
- Use specific imports over namespace imports
- Prefer `const` over `let` when possible
