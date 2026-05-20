# Project Onboarding Handoff & Status Report (v1.0.0)

This document provides a comprehensive summary of the current project state, built architecture, completed sprints, and immediate next steps. It is designed to allow any incoming AI assistant or developer to take over the project and continue development without context loss.

---

## 1. Project Overview & Tech Stack

This is a premium, high-performance, cyberpunk-themed Guild Management System tailored for the **ONIZUKA** guild. The system tracks member registration, roles, daily activities (Quest Logs), leave requests, and guild war performance.

### Core Technology Stack:
*   **Framework:** Next.js 16.2.6 (App Router, React 19.2.4 compatibility)
*   **Language:** TypeScript, HTML5, TailwindCSS v4
*   **Database ORM:** Prisma ORM v7.8.0 (configured with custom output client)
*   **Database:** PostgreSQL (hosted on Neon Cloud) with `@prisma/adapter-pg` driver adapter for Edge-compatible execution
*   **Authentication:** NextAuth.js v4.24.14 with Discord OAuth provider & Custom Prisma adapter
*   **Route Protection & Guard:** `proxy.ts` (Custom Edge-compatible router middleware replacing standard Next.js middleware)

---

## 2. Completed Work (Sprint 1)

Sprint 1 (Onboarding & Member Portal) is fully implemented, styled with custom premium cyberpunk glassmorphism, optimized for React 19 compatibility, and verified.

### 2.1 Discord OAuth Integration & Session Sync
*   **Description:** Integrated NextAuth with Discord Provider. The system automatically syncs the user's `discordId` on initial login and binds it to their profile.
*   **Dynamic JWT Real-time Check:** Updated the `jwt` callback to perform active PostgreSQL checks for the member's ID, status, and role on every session validation. This bypasses Edge cookie stale state issues.
*   **Files:**
    *   auth.ts — NextAuth configuration and custom session/JWT callbacks
    *   components/providers.tsx — Client-side SessionProvider wrapper

### 2.2 Premium Landing Page (Login Page)
*   **Description:** A visually stunning, optimized landing page featuring neon-pink borders, a glowing background, a responsive grid system, and vector-only icon assets (no emojis).
*   **Files:**
    *   app/page.tsx — Main entry landing page with Discord connection CTA

### 2.3 Member Onboarding Registration Form
*   **Description:** A clean, secure onboarding form that prompts newly connected Discord users to input their "In-Game Name" and "Nickname". 
*   **React 19 & NextAuth Cache Fix:** Refactored from `useActionState` to a highly predictable, synchronous client-side `onSubmit` handler. It forces session cookie writes via `update({})` and performs a clean full-page hard redirect to prevent cached middleware loops.
*   **Files:**
    *   app/(public)/onboarding/page.tsx — Registration form UI
    *   app/(public)/onboarding/actions.ts — Onboarding Server Action

### 2.4 Member Waiting Page (Pending Status Portal)
*   **Description:** A wide (`520px` card) Registration Status Portal featuring a vertical cyberpunk step tracker with a pulsing indicator representing the pending admin approval stage, a Discord user snapshot profile, and direct guild contact options.
*   **Files:**
    *   app/(public)/pending/page.tsx — Stepper status portal

---

## 3. Database & Data Structure

The database handles relational integrity through the unique `userId` and `memberId` to track activities.

### Core Models & Fields:

#### User Model (Auth.js Adapter):
*   `id`: Primary key (CUID)
*   `name`: Discord username
*   `image`: Discord Avatar URL
*   `discordId`: Unique Discord user ID string (synced on login)

#### Member Model (Core Guild Data):
Mapped to `User` via a one-to-one relation (`userId` is unique).
*   `id`: Primary key (CUID)
*   `userId`: Foreign key linked to `User.id`
*   `inGameName`: In-Game Name string
*   `nickname`: Real nickname string
*   `role`: Enum `Role` (default: `MEMBER`, options: `GUILD_MASTER`, `VICE_MASTER`, `MEMBER`)
*   `status`: Enum `Status` (default: `PENDING`, options: `PENDING`, `ACTIVE`, `INACTIVE`)
*   `createdAt` & `updatedAt`: Timestamps

#### AuditLog Model (Tracking Administrative Actions):
*   `id`: Primary key (CUID)
*   `actorId`: Foreign key of the Member who performed the action
*   `action`: String (e.g., `APPROVE_MEMBER`, `DEACTIVATE_MEMBER`)
*   `targetType`: Target table name string
*   `targetId`: ID string of the target record
*   `oldValue` & `newValue`: JSON string representations of changes

*File Reference:* prisma/schema.prisma

---

## 4. Next Steps & Action Plan

The immediate next objective is to complete the administrative flow and roll out **Sprint 2 (Quest & Activity Gating)**.

### Immediate Action 1: First Admin Seed Validation
*   To test the web administrative dashboard, the developer must manually promote their first onboarding account to admin status in Prisma Studio:
    1. Complete onboarding at `http://localhost:3000/onboarding`
    2. Open Prisma Studio: `http://localhost:51212`
    3. Find their row in the `Member` table, set `role` to `GUILD_MASTER` and `status` to `ACTIVE`.
    4. Save Changes, log out, and log back in.

### Immediate Action 2: Finalize Admin Dashboard Portal
*   **Path:** app/(admin)/members/page.tsx & MembersClientPage.tsx
*   **Goal:** Provide the active Guild Master / Vice Master with a beautiful grid dashboard to:
    *   Review pending signups in real-time.
    *   Click **Approve** (calls `approveMember` Server Action) to change `status` from `PENDING` to `ACTIVE` and create an AuditLog.
    *   Click **Deactivate** (calls `deactivateMember` Server Action) to change `status` to `INACTIVE`.
*   *Note:* The core backend server actions and initial table layouts are already built and committed. The next assistant should verify this flow with the seeded Guild Master account.

### Sprint 2 Tasks (Quest & Leave System):
Upon completion of the Admin Dashboard verification, proceed to:
1.  **Season Management (`feat/season-management`):** Admin controls at `app/(admin)/seasons/` to open and close monthly Guild seasons.
2.  **Leave Requests (`feat/leave-request`):** Client form for members to request leaves and admin review interface to approve/reject.
3.  **Absent Checks (`feat/bulk-absent` & `feat/quest-check-ui`):** Daily active check center supporting screenshot uploads, quick attendance checklist, and automated absent logs.

*Detailed Sprint 2 reference:* sprints/SPRINT_2_QUEST.md

---

## 5. Directory & Route Map

*   `/` — Home Landing & Connect Discord Page
*   `/onboarding` — Connect Member Profile Form (Gated)
*   `/pending` — Waiting for Admin Review Portal (Gated)
*   `/deactivated` — Suspended Member warning screen (Gated)
*   `/dashboard` — Main Active Member Dashboard (Gated, Active members only)
*   `/members` — Admin Member Management table (Gated, GUILD_MASTER/VICE_MASTER only)
*   `lib/rbac.ts` — Server-side Session validation helpers
*   `proxy.ts` — Edge router checking route rules on every fetch
