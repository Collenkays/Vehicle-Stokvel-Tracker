# Multi-Stokvel Type Creator Feature

A comprehensive enhancement to the Vehicle Stokvel Tracker that transforms it into a flexible multi-type stokvel management platform.

## Overview

This feature allows users to create and manage various types of stokvels—not just vehicle stokvels—each with its own settings, payout logic, and contribution model. The system supports predefined stokvel types with customizable rules and dynamic business logic.

## New Database Schema

### Core Tables

#### `stokvel_types` 
Predefined stokvel templates with configurable rules:
- Vehicle Stokvel (R100,000 target, rotation-based)
- Savings Stokvel (monthly rotation, cash payouts)
- Grocery Stokvel (yearly bulk purchases)
- Burial Society (event-based emergency payouts)
- Investment Stokvel (profit distribution)
- Education Stokvel (application-based support)
- Holiday Stokvel (seasonal savings)

#### `user_stokvels`
User-created stokvels with customized settings and rules

#### `user_stokvel_members`
Members per stokvel with role-based permissions

#### `stokvel_contributions` & `stokvel_payouts`
Stokvel-specific financial transactions

## Frontend Features

### 1. Create Stokvel Wizard (`/create-stokvel`)
Multi-step wizard with:
- **Step 1**: Choose stokvel type from catalog
- **Step 2**: Basic stokvel information
- **Step 3**: Contribution rules and target amounts
- **Step 4**: Add initial members (optional)
- **Step 5**: Review and create

### 2. My Stokvels Dashboard (`/my-stokvels`)
- View all user's stokvels with summary cards
- Filter by active/inactive status
- Quick navigation to individual stokvel dashboards
- Create new stokvel shortcut

### 3. Stokvel Type Catalog (`/browse-stokvel-types`)
- Browse predefined stokvel types
- Filter by frequency and distribution type
- Search functionality
- Detailed type descriptions with rules

### 4. Dynamic Stokvel Dashboard (`/stokvel/:id/dashboard`)
Context-aware dashboard that adapts to stokvel type:
- Type-specific metrics and charts
- Custom payout triggers and logic
- Appropriate UI components per stokvel type

## Backend Logic Engine

### Dynamic Rules Engine (`StokvelLogicEngine`)
Handles different payout triggers:
- **Threshold-based**: Vehicle stokvels (R100K target)
- **Monthly rotation**: Savings stokvels
- **Yearly**: Grocery/holiday stokvels
- **Event-based**: Burial societies
- **Profit distribution**: Investment stokvels
- **Application-based**: Education stokvels

### Intelligent Payout Calculations
- Context-aware payout amounts
- Different distribution methods (equal, rotation, merit-based)
- Rollover balance management
- Type-specific business logic

## Technical Implementation

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **UI Components**: Shadcn/UI with custom components
- **State Management**: React Query for server state
- **Routing**: React Router with nested routes
- **Backend**: Supabase (PostgreSQL + Auth + RLS)

### Key Components
- `CreateStokvelWizard`: Multi-step form with validation
- `MyStokvels`: Dashboard with stokvel cards and filtering
- `StokvelTypeCatalog`: Browse and search stokvel types
- `StokvelLogicEngine`: Dynamic business rules engine
- Updated `Layout`: Multi-stokvel navigation and context switching

### Database Features
- Row Level Security (RLS) for multi-tenant data isolation
- Optimized indexes for performance
- JSONB rules templates for flexible configuration
- Comprehensive views for dashboard data

## User Experience

### Navigation Flow
1. **Entry Point**: `/my-stokvels` - Central hub for all stokvels
2. **Discovery**: `/browse-stokvel-types` - Explore available types
3. **Creation**: `/create-stokvel` - Guided setup process
4. **Management**: `/stokvel/:id/*` - Individual stokvel dashboards

### Context Switching
- Seamless navigation between multiple stokvels
- Persistent context with URL-based routing
- Breadcrumb navigation and stokvel selector
- Type-aware UI components and features

## Business Rules by Stokvel Type

### Vehicle Stokvel
- Target amount: R100,000
- Rotation-based payouts
- Monthly contributions
- Threshold trigger

### Savings Stokvel
- Monthly rotation
- Cash distribution
- Equal member payouts
- Rollover balances

### Grocery Stokvel
- Annual payout (December)
- Bulk purchase coordination
- Group buying power
- Seasonal timing

### Burial Society
- Emergency event triggers
- Quick access to funds
- Community support model
- Flexible contribution timing

### Investment Stokvel
- Profit-based distributions
- Reinvestment options
- Quarterly reviews
- Growth tracking

## Security & Permissions

### Row Level Security
- Users can only access their own stokvels
- Members can only view stokvels they belong to
- Admin/owner permissions for management
- Secure multi-tenant data isolation

### Role-Based Access
- **Owner**: Full stokvel management
- **Admin**: Member and contribution management
- **Member**: View and contribute only

## Migration Strategy

### Backward Compatibility
- Existing single-stokvel data preserved
- Legacy routes continue to work
- Gradual migration to multi-stokvel interface
- Data migration scripts for existing users

### Database Migration
```sql
-- Run database-schema-multi-stokvel.sql
-- Migrate existing data from old schema
-- Update RLS policies for new structure
```

## Future Enhancements

### Phase 2 Features
- WhatsApp integration for notifications
- Payment gateway integration
- Advanced reporting across all stokvels
- Mobile app support
- Multi-currency support

### Admin Features
- System-wide stokvel type management
- Custom stokvel type creation
- Analytics and insights
- Bulk operations

## Getting Started

### Setup Instructions
1. Run the new database schema: `database-schema-multi-stokvel.sql`
2. Install new dependencies: `@radix-ui/react-progress`
3. Update environment variables (same as before)
4. Start the development server: `npm run dev`

### Key Files Added/Modified
- `src/types/multi-stokvel.ts` - New TypeScript definitions
- `src/hooks/useStokvelTypes.ts` - Stokvel type management
- `src/hooks/useUserStokvels.ts` - Multi-stokvel operations
- `src/services/stokvelLogicEngine.ts` - Dynamic business logic
- `src/pages/MyStokvels.tsx` - Main dashboard
- `src/pages/StokvelTypeCatalog.tsx` - Type browser
- `src/components/CreateStokvelWizard.tsx` - Creation wizard
- `src/components/Layout.tsx` - Updated navigation
- `src/App.tsx` - New routing structure

## API Endpoints

### New Supabase Tables
- `stokvel_types` - GET (public read)
- `user_stokvels` - CRUD (user-scoped)
- `user_stokvel_members` - CRUD (stokvel-scoped)
- `stokvel_contributions` - CRUD (stokvel-scoped)
- `stokvel_payouts` - CRUD (stokvel-scoped)

### Views
- `stokvel_summary` - Aggregated stokvel data for dashboards

This comprehensive enhancement transforms the Vehicle Stokvel Tracker into a versatile multi-stokvel platform while maintaining backward compatibility and providing a smooth migration path for existing users.