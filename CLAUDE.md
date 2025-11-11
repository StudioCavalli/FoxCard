# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FoxCard is an open-source e-commerce platform designed as a free, self-hosted alternative to Shopify. The project is in early development phase with no code yet - only specification exists in `todo/todo.md`.

## Planned Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **UI**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **PWA**: next-pwa with service workers

### Backend
- **API**: Next.js API Routes + tRPC (type-safe APIs)
- **ORM**: Prisma with dual database support (PostgreSQL recommended, MongoDB optional)
- **Authentication**: NextAuth.js
- **Storage**: S3-compatible (MinIO/AWS/Cloudflare R2)
- **Cache**: Redis
- **Job Queue**: BullMQ with Redis

### Mobile
- **Framework**: React Native with Expo
- **Code Sharing**: Shared codebase with web where possible

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL (recommended) or MongoDB
- **License**: MIT License

## Architecture Principles

### Multi-tenancy
- Single instance must support multiple independent stores
- Each store is isolated with its own data and configuration

### Plugin System
- Standardized API with React hooks and API endpoints
- Each plugin is an autonomous folder
- Hot reload support (enable/disable without restart)
- Plugin types: payments, shipping, marketing, SEO, third-party integrations

### Theme System
- Component-based React architecture
- Visual editor for customization (colors, fonts, layouts)
- Live preview before activation
- Partial override capability (preserve updates while customizing)

### Performance Targets
- Lighthouse score: 95+
- LCP (Largest Contentful Paint): < 2 seconds
- Mobile-first, responsive design
- Aggressive code splitting and lazy loading

## Key Differentiators

1. **Zero Cost**: Completely free with no transaction fees
2. **Self-hosted**: Full control over data and infrastructure
3. **Dual Database Support**: Choose between PostgreSQL or MongoDB at installation
4. **One-Click Installer**: WordPress-style installation via web interface
5. **White-label Mobile Apps**: Each merchant can publish their own branded app

## Development Requirements

### Code Quality
- Clean, well-commented code following best practices
- TypeScript strict mode
- Comprehensive error handling

### Security
- HTTPS mandatory
- Rate limiting on all APIs
- CSRF/XSS protection
- Input sanitization
- Environment variables managed via admin UI (not hardcoded)

### Performance Optimizations
- Automatic image optimization (Sharp, WebP format)
- CDN for static assets
- Database indexing
- Stateless architecture for horizontal scaling
- Multi-level caching strategy

### Default Theme Requirements
- Minimaliste, modern design (reference: `todo/ui:ux.pdf` when available)
- Native dark mode support
- WCAG accessibility compliance
- Components: mega-menu header, advanced product filters, quick view, slide-in cart, customizable footer

## MVP (Phase 1) Deliverables

When implementing features, prioritize these MVP requirements:
1. Core e-commerce functionality (products, cart, checkout)
2. Automatic installer with web-based configuration
3. Complete admin dashboard
4. Default theme
5. Two payment methods: Stripe (priority) and PayPal
6. PWA functionality
7. Basic documentation
8. Plugin/theme architecture foundation

## Phase 2 Features

Post-MVP features to implement later:
- iOS/Android apps
- Plugin marketplace
- Additional themes
- Native multi-language support
- Advanced analytics

## Important Notes

- **Ease of use is critical**: Simple for merchants to use, easy for developers to contribute to
- **No code configuration**: All setup must be possible via web interface
- **Merchant focus**: Prioritize merchant experience over developer convenience when conflicts arise
- **Language**: Project documentation is in French, but code/comments should follow English conventions for wider open-source adoption
