# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vehicle Stokvel Tracker - A React + TypeScript web application for managing stokvels (South African savings clubs) that pool monthly contributions to purchase e-hailing vehicles for members through a rotation system. Built with Vite, Tailwind CSS, Supabase backend, and React Query for state management.

## Development Commands

### Daily Development
```bash
npm run dev              # Start dev server on http://localhost:5173
npm run build            # Build for production (runs tsc + vite build)
npm run preview          # Preview production build locally
npm run lint             # Run ESLint on all .ts/.tsx files
```

### TypeScript
```bash
npx tsc --noEmit        # Type check without emitting files
```

## Environment Setup

**Required**: Create `.env.local` with Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Database**: Run SQL migrations from `database-schema-multi-stokvel.sql` in Supabase SQL editor.

## Architecture & Patterns

### Multi-Stokvel Architecture

The application evolved from single-stokvel to **multi-stokvel support**, allowing users to create, join, and manage multiple stokvels simultaneously. Key architectural elements:

**Stokvel Types System**: Pre-defined templates (Vehicle Purchase, Grocery, Burial, etc.) with configurable rules for payout triggers, distribution methods, and contribution frequencies.

**StokvelLogicEngine** (`src/services/StokvelLogicEngine.ts`): Central business logic engine that:
- Determines payout triggers based on stokvel type rules (threshold, monthly rotation, yearly, event-based, etc.)
- Calculates payout amounts and distribution methods (equal, rotation, merit-based)
- Handles contribution requirements based on frequency (monthly, quarterly, yearly, as-needed)
- Manages member rotation and eligibility
- Calculates fairness adjustments after cycle completion

**Database Schema**: Four main tables:
- `stokvel_types`: Pre-defined stokvel templates with rules
- `user_stokvels`: User-created stokvel instances
- `user_stokvel_members`: Member participation with rotation tracking
- `stokvel_contributions`: Payment records with verification
- `stokvel_payouts`: Vehicle/cash distribution history

### State Management Pattern

**React Query** (`@tanstack/react-query`) for server state with custom hooks in `src/hooks/`:

- `useUserStokvels.ts`: Multi-stokvel operations (CRUD, member management)
- `useMembers.ts`: Member lifecycle and rotation order
- `useContributions.ts`: Contribution recording and verification
- `usePayouts.ts`: Payout generation and completion
- `useDashboard.ts`: Aggregated dashboard metrics
- `useStokvelTypes.ts`: Template catalog

**Pattern**: Each hook returns query/mutation functions with automatic cache invalidation. All database operations go through Supabase client with RLS policies.

### Authentication Flow

**AuthContext** (`src/contexts/AuthContext.tsx`): Global auth state with Supabase Auth integration
- Provides: `user`, `session`, `loading`, `signIn()`, `signUp()`, `signOut()`
- Automatic session persistence and real-time auth state changes
- Protected routes via `ProtectedRoute` component redirect to `/login` if unauthenticated

### Routing Structure

Two routing patterns coexist:

**Full-screen routes** (wizard flows without sidebar):
- `/browse-stokvel-types`: Catalog of stokvel templates
- `/create-stokvel`: Multi-step wizard for stokvel creation

**Layout-wrapped routes** (with sidebar navigation):
- `/my-stokvels`: User's stokvel list
- `/stokvel/:stokvelId/*`: Context-specific views (dashboard, members, contributions, payouts, reports, settings, fairness)

### Component Organization

- `src/components/ui/`: Shadcn/UI primitives (buttons, dialogs, forms, etc.)
- `src/components/`: Feature components (Layout, ProtectedRoute, InstallPrompt, CreateStokvelWizard)
- `src/pages/`: Route-level page components
- Path alias: `@/*` maps to `./src/*` (configured in vite.config.ts and tsconfig.json)

### Type System

**Primary types** in `src/types/multi-stokvel.ts`:
- `StokvelRulesTemplate`: Configuration for payout triggers, distribution methods, frequencies
- `UserStokvel`, `StokvelMember`, `StokvelContribution`, `StokvelPayout`: Database table types
- `StokvelWithType`: Extended type with joined stokvel type information
- `StokvelDashboardData`: Aggregated dashboard data structure

**Supabase types** auto-generated in `src/types/supabase.ts`

### Business Rules

**Contribution System**:
- Base monthly contribution (typically R3,500)
- First month includes joining fee (R1,500)
- Post-vehicle receipt: Higher contribution (R8,000) from members who received vehicles
- Verification required before balance inclusion

**Payout System**:
- Triggered when balance reaches target (default R100,000)
- Sequential rotation order (1-13 members)
- Skip members who already received vehicles
- Automatic rollover of remaining balance
- Multiple trigger types supported via StokvelLogicEngine

**Fairness Calculation**:
- Triggered when all members receive vehicles (cycle complete)
- Formula: `net_position = vehicle_amount - total_paid`
- Adjustment: `average_net_position - member_net_position`
- Leftover pot distributed equitably

### UI Component Library

**Shadcn/UI** components with Tailwind CSS:
- Radix UI primitives for accessibility
- `cn()` utility in `src/utils/cn.ts` for class name merging
- Framer Motion for animations
- Lucide React for icons
- Recharts for data visualization

### Key Utilities

- `src/utils/currency.ts`: ZAR formatting with R prefix
- `src/utils/date.ts`: Date parsing and formatting for South African context
- `src/lib/supabase.ts`: Supabase client singleton with environment validation

## Code Style Conventions

- TypeScript strict mode enabled
- React functional components with hooks
- Async/await for Supabase operations with error handling
- Query invalidation after mutations for cache freshness
- Protected routes check authentication before render
- Use path aliases (`@/`) for imports, not relative paths

## Testing Notes

No test framework currently configured. When adding tests, consider:
- Vitest for unit tests (Vite-native)
- React Testing Library for component tests
- Mock Supabase client for integration tests

## Database Considerations

**Supabase RLS**: Row Level Security policies enforce data access control. When debugging permissions issues, check RLS policies in SQL files (`fix-all-rls-policies.sql`, etc.).

**Real-time subscriptions**: Supabase supports real-time updates. Consider implementing for live contribution tracking in future iterations.

## PWA Support

Progressive Web App capabilities configured:
- `manifest.json` for installability
- Service worker registration in `main.tsx`
- `InstallPrompt` component for installation UI
- Apple touch icons and meta tags in `index.html`
