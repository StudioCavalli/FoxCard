# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FoxCard is an open-source, self-hosted multi-tenant e-commerce marketplace. A single instance hosts multiple independent stores, each with its own products, orders, themes, and configuration. Stores are typed by commerce vertical (19 types: GENERAL, FOOD, RESTAURANT, HOTEL, TRAVEL, DIGITAL, etc.) which controls available features, UI terminology, and checkout flow.

## Commands

```bash
npm run dev              # Start dev server (Next.js with Turbopack)
npm run build            # Generate Prisma client + Next.js production build
npm run lint             # ESLint
npm test                 # Vitest (all unit/integration tests)
npm run test:watch       # Vitest in watch mode
npm run test:coverage    # Vitest with V8 coverage

# Database
npm run db:generate      # Regenerate Prisma client after schema changes
npm run db:push          # Push schema to MongoDB (no migrations — uses db push)
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed database (tsx prisma/seed.ts)

# Utility scripts (run with tsx)
npx tsx scripts/init-rbac.ts        # Initialize RBAC roles/permissions
npx tsx scripts/install-themes.ts   # Seed default themes
npx tsx scripts/activate-theme.ts   # Activate a theme
npx tsx scripts/list-users.ts       # List all users
npx tsx scripts/fix-store-status.ts # Fix store status issues
```

Tests live in `./tests/` — unit tests use Vitest with jsdom; e2e tests use Playwright (`tests/e2e/`). Run a single test file with `npx vitest run tests/path/to/file.test.ts`.

## Architecture

### Routing & i18n

All pages are under `app/[locale]/` using next-intl. Five locales: `fr`, `en`, `de`, `es`, `sk` (Slovak is the default). Translation files are in `messages/{locale}.json`. i18n config lives in `lib/i18n/config.ts` (re-exported from root `i18n.ts`).

### Three dashboard tiers

- **Storefront** — `app/[locale]/` — public-facing: products, categories, cart, checkout, stores directory, explore
- **Merchant** — `app/[locale]/merchant/` — store owner dashboard: products, orders, analytics, settings, team, themes. Has its own layout with sidebar nav configured in `lib/merchant/navigation-config.ts`
- **Admin/Superadmin** — `app/[locale]/admin/` and `app/[locale]/superadmin/` — platform-level: all stores, users, roles, platform settings, commerce types, appeals

### API layer

- **tRPC** (`lib/trpc/`) — primary API for all frontend calls. The root router is `lib/trpc/routers/_app.ts` which composes ~40 domain routers. Client is initialized in `lib/trpc/client.ts`, wrapped in `lib/trpc/Provider.tsx`.
- **REST API v1** (`app/api/v1/`) — external API for products, orders, customers (API key authenticated)
- **Webhooks** (`app/api/webhooks/`) — Stripe and PayPal webhook handlers
- **Cron routes** (`app/api/cron/`) — abandoned carts, automation execution, bank transfers, loyalty expiration

### tRPC procedure hierarchy

Defined in `lib/trpc/trpc.ts`:
- `publicProcedure` — no auth
- `protectedProcedure` — requires session
- `adminProcedure` — requires ADMIN or SUPER_ADMIN role
- `superAdminProcedure` — requires SUPER_ADMIN role
- `requirePermission(perm)` / `requirePermissions([...])` / `requireAnyPermission([...])` — RBAC per-store; input must include `storeId`
- `requirePlatformPermission(perm)` — platform-level superadmin permissions
- `requireStoreAccess` — verifies user is store owner or active StoreUser, checks store status

### Auth

NextAuth v4 with credentials provider (`lib/auth.ts`). Session extended with `role`, `storeId`, `storeName` in `types/next-auth.d.ts`. RBAC system in `lib/rbac/`.

### State management

- **Zustand** stores in `lib/store/` — `cart.ts` (persisted, multi-store aware), `ui.ts`, `use-store.ts`
- **React Query** via tRPC for server state
- **React contexts** — `lib/context/` for store context, sidebar; `lib/currency/CurrencyContext.tsx`; `lib/platform/PlatformSettingsProvider.tsx`

### Database

MongoDB via Prisma (`prisma/schema.prisma`, ~4400 lines). The `Store` model is the multi-tenancy root — most entities reference a `storeId`. Commerce type is set per-store via the `CommerceType` enum and `commerceConfig` JSON field.

### Commerce type system

19 commerce types defined in `lib/commerce-types/index.ts`. Each type has feature flags (physical/digital products, bookings, reservations, age verification, etc.), terminology overrides (`lib/commerce-types/terminology.ts`), and hooks (`lib/commerce-types/hooks.ts`). The commerce type drives which merchant dashboard pages appear and which checkout flow is used.

### Key subsystems in `lib/`

- `plugins/` — plugin system with manager, hook executor, templates, and types
- `themes/` — theme system with presets, commerce-type-specific themes, merge logic, and manager
- `email/` — email service with React Email templates, automation, campaigns, i18n
- `crsdpay/` — custom payment gateway with card tokenization, crypto payments, fraud detection
- `booking/` — booking/reservation manager for service-type stores
- `hotel/`, `restaurant/`, `travel/` — vertical-specific business logic managers
- `payment-gateway/` — crypto payment and security utilities
- `digital/` — download manager for digital products
- `webhooks/` — webhook manager and types
- `pdf/` — invoice PDF generation with React PDF

### Component organization

- `components/ui/` — shared UI primitives (buttons, inputs, modals, commerce-specific)
- `components/layout/` — Header, Footer
- `components/merchant/` — merchant dashboard components (navigation, product forms, mobile)
- `components/admin/` — admin components (analytics, charts, email, theme editor)
- `components/storefront/` — public product display
- `components/cart/`, `components/checkout/` — shopping flow
- Domain-specific: `components/booking/`, `components/alcohol/`, `components/crsdpay/`, etc.

### PWA

Configured via `@ducanh2912/next-pwa` in `next.config.js` with Workbox runtime caching. Disabled in development. Manifest at `public/manifest.json`.

## Important Notes

- **Language convention**: Project docs are in French, code and comments in English
- **Merchant focus**: prioritize merchant experience over developer convenience
- **All configuration via web UI**: no `.env` editing required for merchants post-install
- **Path alias**: `@/` maps to project root (configured in `tsconfig.json`)
- **Database operations**: use `db push` not migrations (MongoDB doesn't support Prisma migrate)
- **Store isolation**: always scope queries by `storeId` — never leak data across stores
- **Commerce type awareness**: when modifying merchant/checkout flows, respect the store's `commerceType` and its feature flags
