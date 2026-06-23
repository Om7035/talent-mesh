# TalentMesh AI - Complete Frontend Platform

## Overview

TalentMesh AI is an enterprise-grade student talent intelligence platform that combines a freelance marketplace with placement intelligence. This frontend is built with Next.js 16, TypeScript, Tailwind CSS, and Framer Motion for smooth animations.

## Key Features

### Design System
- **Dark Mode First**: Premium dark aesthetic inspired by Linear, Stripe, and Vercel
- **Color Palette**: Blue primary (#3b82f6), Cyan secondary, Purple accents
- **Components**: Reusable shadcn/ui-based components with custom styling
- **Animations**: Framer Motion for smooth, professional transitions

### Public Pages
- **Landing Page**: Hero section with stats, features, how-it-works, and CTA
- **Authentication**: Login and role-based signup (Student, Client, Recruiter)
- **Marketing**: About, Features, and Pricing pages

### Role-Based Dashboards

#### Student Module
- **Dashboard**: Reputation score, active projects, earnings, recommendations
- **Profile**: Skills management, certifications, social links
- **Portfolio**: Project showcase with view tracking and performance analytics
- **Leaderboard**: Global, college, and skill-based rankings
- **Marketplace**: Browse projects with advanced filtering

#### Client Module
- **Dashboard**: Projects, spending trends, application management
- **Post Project**: Complete project creation workflow with skill matching
- **Project Management**: Track active and completed contracts

#### Recruiter Module
- **Dashboard**: Candidate discovery with analytics
- **Talent Search**: Advanced filtering by skills and college
- **Hiring Pipeline**: Track candidates through hiring stages

#### TPO Module
- **Dashboard**: College analytics and placement metrics
- **Student Analytics**: Skill distribution and placement readiness
- **Recruiter Management**: Track company interest and requests

#### Admin Module
- **System Dashboard**: Platform metrics and health
- **Moderation Queue**: Content review and spam management
- **Security Alerts**: Fraud detection and system monitoring

## Project Structure

```
/app
  ├── page.tsx (Landing page)
  ├── login/page.tsx
  ├── signup/page.tsx
  ├── about/page.tsx
  ├── features/page.tsx
  ├── pricing/page.tsx
  ├── marketplace/page.tsx
  ├── dashboard/
  │   ├── student/page.tsx
  │   ├── client/page.tsx
  │   ├── recruiter/page.tsx
  │   ├── tpo/page.tsx
  │   └── admin/page.tsx
  ├── student/
  │   ├── profile/page.tsx
  │   ├── portfolio/page.tsx
  │   └── leaderboard/page.tsx
  └── client/
      └── post-project/page.tsx

/components
  ├── layout/
  │   ├── navbar.tsx (Top navigation)
  │   ├── sidebar.tsx (Role-based sidebar)
  │   └── dashboard-layout.tsx (Wrapper)
  ├── dashboard/
  │   └── stat-card.tsx (Animated stat cards)
  └── ui/
      ├── card.tsx (Card components)
      └── button.tsx (Button component)

/lib
  ├── design-tokens.ts (Colors, typography, spacing)
  └── utils.ts (Helper functions)
```

## Key Components

### Layout Components
- **Navbar**: Fixed top navigation with logo, links, notifications, and user menu
- **Sidebar**: Role-based navigation with collapsible menu
- **DashboardLayout**: Main wrapper that combines navbar and sidebar

### Dashboard Components
- **StatCard**: Animated stat card with icon, trend indicator, and glass effect option
- **Card**: Reusable card with header, content, footer, and optional glass morphism

### Pages
All pages feature:
- Smooth page transitions with Framer Motion
- Staggered child animations
- Responsive grid layouts
- Real-time chart visualizations with Recharts
- Professional data presentations

## Design Tokens

Colors:
- Primary: Blue (#3b82f6)
- Secondary: Cyan (#06b6d4)
- Accent: Purple (#8b5cf6)
- Success: Green (#10b981)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)

Spacing Scale: xs, sm, md, lg, xl, 2xl, 3xl, 4xl
Border Radius: Consistent use of rounded-lg and rounded-xl

## Authentication Flow

The platform supports role-based authentication with 5 distinct user types:
1. **Student**: Freelance talent seeking projects
2. **Client**: Companies posting projects
3. **Recruiter**: HR professionals discovering talent
4. **TPO**: Training & Placement Officers from colleges
5. **Admin**: Platform administrators

Each role has customized:
- Navigation menus
- Dashboard layouts
- Available features and permissions
- Data access patterns

## Data Visualization

Integrated Recharts for professional dashboards:
- Line charts (earnings, placement trends)
- Bar charts (revenue, projects by month)
- Pie charts (skill distribution, hiring pipeline)
- Area charts (platform growth)

## Responsive Design

- Mobile-first approach
- Tablet-optimized layouts
- Desktop-enhanced features
- Adaptive navigation (hamburger menu on mobile)
- Touch-friendly spacing and buttons

## Performance Optimizations

- Next.js 16 with Turbopack
- Dynamic imports for code splitting
- Image optimization ready
- CSS-in-JS with Tailwind for minimal bundle size
- Framer Motion for GPU-accelerated animations

## Getting Started

1. Install dependencies: `pnpm install`
2. Start dev server: `pnpm dev`
3. Open http://localhost:3000

## Navigation Architecture

- Public pages link to signup/login
- Auth pages redirect to role-specific dashboards
- Sidebar navigation provides access to role features
- Breadcrumb hierarchy maintained throughout

## Future Enhancements

- Backend API integration
- Real-time notifications
- Payment processing (Stripe)
- File uploads (Vercel Blob)
- Email notifications
- Mobile app (React Native)
- Advanced analytics
- AI-powered recommendations

## Technology Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Components**: shadcn/ui base

## Notes

This is a complete frontend implementation focusing on UI/UX excellence. Backend APIs, database schemas, and business logic are placeholder-ready for future implementation. The design follows enterprise SaaS best practices with attention to accessibility, performance, and user experience.
