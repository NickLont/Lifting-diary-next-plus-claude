# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Code Generation Guidelines

**CRITICAL:** This project has detailed code generation guidelines in the `/docs` directory. You MUST always follow these guidelines when writing or modifying code.

**Required reading before writing code:**
- **`/docs/ui.md`** - UI component standards (shadcn/ui only, no custom components, Tailwind CSS)
- **`/docs/data-fetching.md`** - Data fetching patterns (Server Components only, data layer in `/data`, Drizzle ORM, user isolation)
- **`/docs/data-mutations.md`** - Data mutation patterns (Server Actions in colocated `actions.ts`, data layer in `/data`, Drizzle ORM, Zod validation)
- **`/docs/auth.md`** - Authentication standards (Clerk only, `ClerkProvider`, `auth()`, Clerk UI components)
- **`/docs/code-styling.md`** - Code style standards (arrow functions, naming conventions)

## Development Workflow

**CRITICAL - Node.js Version:**
- **ALWAYS run `nvm use` before executing ANY bash commands** (npm, npx, node, etc.)
- This project requires Node.js 22 (specified in `.nvmrc`)
- Running commands with the wrong Node version will cause dependency and build errors

**CRITICAL - Code quality checks after changes:**
1. **TypeScript check:** Run `npx tsc --noEmit` to verify types are correct
2. **Linting:** Run `npm run lint:fix` on the affected files to ensure code style compliance
   - Use: `npm run lint:fix -- <file-path>` for specific files
   - If linter configuration has issues, ensure TypeScript check passes at minimum
3. **Check for deprecation warnings:** After running dev server or build, check console for deprecation warnings
4. These checks should NEVER be skipped before committing code

**Component Usage Guidelines:**
- Before using any shadcn/ui component, check the latest documentation at https://ui.shadcn.com/docs/components
- Check the underlying library's documentation (e.g., react-day-picker for Calendar)
- Look for TypeScript @deprecated tags in component prop types
- Test components after installation to catch deprecation warnings early

## Project Overview

This is a **lifting diary** application built with Next.js 16.1.6, React 19, TypeScript, and Tailwind CSS v4. The project uses Clerk for authentication.

**Requirements:**
- Node.js 22 (see `.nvmrc` for version management)

## Development Commands

**Always run first:**
```bash
# Switch to correct Node.js version
nvm use
```

**Then run any of these:**
```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

## Architecture

### Next.js App Router
- Uses the **App Router** (not Pages Router) with the `app/` directory
- File-based routing: `app/page.tsx` → `/`, `app/foo/page.tsx` → `/foo`
- `app/layout.tsx` is the root layout that wraps all pages
- Server Components by default (add `"use client"` directive for client components)

### Styling
- **Tailwind CSS v4** with PostCSS integration (`postcss.config.mjs`)
- Global styles in `app/globals.css`
- Tailwind v4 uses a different configuration approach than v3 (CSS-based, not JS config)

### TypeScript
- Path alias configured: `@/*` maps to the root directory
- Strict mode enabled
- Target: ES2017
- **CRITICAL:** ALWAYS use `import type` when importing TypeScript types, interfaces, or type aliases
  ```typescript
  // ✅ CORRECT
  import type { User } from '@/types/user'
  import type { WorkoutWithRelations } from '@/data/workouts'

  // ❌ WRONG
  import { User } from '@/types/user'
  import { WorkoutWithRelations } from '@/data/workouts'
  ```

### Linting
- **ESLint 9** with flat config (`eslint.config.mjs`)
- Uses **neostandard** (Standard style for ESLint 9): single quotes, no semicolons, 2-space indent
- Integrated with Next.js rules for TypeScript and React
- Custom rule overrides can be added in `eslint.custom.mjs`

### Fonts
- Uses Geist Sans and Geist Mono fonts loaded via `next/font/google`
- Font variables defined in root layout: `--font-geist-sans` and `--font-geist-mono`

### Authentication
- **Clerk** (`@clerk/nextjs`) is configured in `app/layout.tsx` with `ClerkProvider`
- Environment variables required in `.env.local`:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Get from Clerk dashboard
  - `CLERK_SECRET_KEY` - Get from Clerk dashboard
- See `.env.example` for full configuration template
- Conditional rendering components: `<SignedIn>`, `<SignedOut>`, `<Protect>`

## Key Files

- `app/layout.tsx` - Root layout with fonts and metadata
- `app/page.tsx` - Homepage
- `next.config.ts` - Next.js configuration
- `eslint.config.mjs` - ESLint flat config (new format)
- `tsconfig.json` - TypeScript configuration with `@/*` path alias
