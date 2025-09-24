# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI chatbot application built with Next.js 15 and the AI SDK. It features a modern architecture using App Router, Server Components, and integrates with multiple AI model providers through Vercel's AI Gateway. The application includes authentication, chat history persistence, and file upload capabilities.

## Development Commands

### Core Development
- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Run database migrations and build for production
- `pnpm start` - Start production server

### Code Quality
- `pnpm lint` - Check code with Ultracite linter (`npx ultracite@latest check`)
- `pnpm format` - Format and fix code automatically (`npx ultracite@latest fix`)

### Database Operations
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:push` - Push schema changes to database
- `pnpm db:pull` - Pull schema from database
- `pnpm db:check` - Check migration files
- `pnpm db:up` - Apply migrations

### Testing
- `pnpm test` - Run Playwright tests

## Architecture Overview

### App Structure (Next.js App Router)
- `app/(auth)/` - Authentication routes and pages (login, register)
- `app/(chat)/` - Main chat application routes and API endpoints
- `app/layout.tsx` - Root layout with theme provider and auth context

### Key Directories
- `lib/` - Core application logic and utilities
  - `lib/ai/` - AI model configurations, prompts, tools, and providers
  - `lib/db/` - Database schema, queries, and migrations using Drizzle ORM
  - `lib/auth/` - Authentication configuration and utilities
- `components/` - Reusable UI components built with Radix UI and shadcn/ui
- `hooks/` - Custom React hooks
- `artifacts/` - Code execution and artifact generation

### Database Layer
- **ORM**: Drizzle with PostgreSQL (Neon Serverless)
- **Schema**: `lib/db/schema.ts` - Defines user, chat, message, and document tables
- **Queries**: `lib/db/queries.ts` - Database operations and business logic
- **Migrations**: Automatically run before build via `tsx lib/db/migrate`

### AI Integration
- **Models**: Configured in `lib/ai/models.ts` with xAI Grok models as default
- **Providers**: `lib/ai/providers.ts` handles model provider routing through AI Gateway
- **Tools**: `lib/ai/tools/` contains various AI tools (document creation, weather, suggestions)
- **Prompts**: `lib/ai/prompts.ts` contains system prompts and AI instructions

### Authentication
- **Auth.js** (NextAuth.js) for authentication
- Configuration in `app/(auth)/auth.config.ts` and `app/(auth)/auth.ts`
- Guest mode and persistent sessions supported

## Code Quality Standards

This project uses **Ultracite** for linting and formatting, which enforces:
- Strict TypeScript type safety
- React and Next.js best practices
- Accessibility compliance (a11y)
- Performance optimizations
- Consistent code style
Read .cursor/rules/ultracite.mdc for full documentation!

### Key Rules
- Use `export type` and `import type` for TypeScript types
- Avoid TypeScript enums, prefer const assertions
- Use arrow functions over function expressions
- Maintain strict accessibility standards
- Follow React hooks rules and component patterns
- Use semantic HTML elements and proper ARIA attributes

## Environment Configuration

Required environment variables (see `.env.example`):
- `AI_GATEWAY_API_KEY` - For non-Vercel deployments
- `POSTGRES_URL` - Database connection string
- `AUTH_SECRET` - NextAuth.js secret
- `BLOB_READ_WRITE_TOKEN` - For file storage

## File Storage
- **Vercel Blob** for file uploads and storage
- File upload API at `app/(chat)/api/files/upload/route.ts`

## Testing
- **Playwright** for end-to-end testing
- Test configuration in `playwright.config.ts`
- Tests located in `tests/` directory

## Database Migrations
Migrations are automatically run before builds. To create new migrations:
1. Modify `lib/db/schema.ts`
2. Run `pnpm db:generate`
3. Review generated migration in `lib/db/migrations/`
4. Apply with `pnpm db:migrate`

## AI Model Configuration
- Default models: `grok-2-vision-1212`, `grok-3-mini` (xAI)
- Model switching supported through AI Gateway
- Custom tools and prompts can be added in `lib/ai/tools/` and `lib/ai/prompts.ts`

## Component Architecture
- Built with **shadcn/ui** components extending Radix UI primitives
- Styling with **Tailwind CSS**
- Theme switching with **next-themes**
- Framer Motion for animations
- Component configuration in `components.json`