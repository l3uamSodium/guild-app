# Sprint 0 — Foundation

> เป้าหมาย: ตั้ง project, schema, auth ให้พร้อมก่อนเริ่ม feature ใดๆ

---

## Tasks & Branches

### Task 1: `feat/project-init`
**สิ่งที่ต้องสร้าง:**
- `package.json` (dependencies ทั้งหมด)
- `tailwind.config.ts`
- `.env.example`
- `README.md` (main)
- folder structure ตาม docs

**Prompt สำหรับ AI:**
```
สร้าง Next.js 14 project structure สำหรับ Guild Management App
Tech stack: Next.js 14 App Router, Prisma, Auth.js, Tailwind CSS, Shadcn UI
สร้าง:
1. .env.example พร้อม variables ทั้งหมดที่ต้องใช้
2. tailwind.config.ts พร้อม custom colors: dark bg #0F0F14, surface #1A1A24, primary purple #C084FC, accent pink #F472B6
3. folder structure: app/(public) app/(auth) app/(member) app/(admin) actions/ lib/ components/ui components/features
```

---

### Task 2: `feat/db-schema`
**สิ่งที่ต้องสร้าง:**
- `prisma/schema.prisma` (complete, ตาม DB_SCHEMA.md)
- `prisma/migrations/` (initial migration)

**Prompt สำหรับ AI:**
```
สร้าง prisma/schema.prisma สำหรับ Guild Management App
ตาม spec ใน docs/DB_SCHEMA.md ทุกอย่าง
สำคัญ:
- QuestLog และ WarLog ต้องมี seasonId
- LeaveRequest ต้องมี status enum (PENDING/APPROVED/REJECTED)
- ไม่มี total_points column ใน Member
- ใส่ @@unique ทุกจุดที่ระบุไว้
หลังสร้าง schema ให้บอก SQL command สำหรับ Partial Unique Index ของ GuildSeason
```

---

### Task 3: `feat/auth-discord`
**สิ่งที่ต้องสร้าง:**
- `auth.ts` (Auth.js config)
- `app/api/auth/[...nextauth]/route.ts`
- เก็บ `discordId` ลงใน User model

**Prompt สำหรับ AI:**
```
สร้าง Auth.js (NextAuth v5) config สำหรับ Next.js 14 App Router
ใน auth.ts และ app/api/auth/[...nextauth]/route.ts
- ใช้ Discord Provider เท่านั้น
- ใช้ PrismaAdapter
- ใน callbacks.session ให้เพิ่ม user.id และ member.role ลง session
- ใน callbacks.signIn ให้เก็บ discordId จาก account.providerAccountId ลงใน User
```

---

### Task 4: `feat/rbac-middleware`
**สิ่งที่ต้องสร้าง:**
- `middleware.ts` (route protection)
- `lib/rbac.ts` (helper functions)

**Prompt สำหรับ AI:**
```
สร้าง middleware.ts สำหรับ Next.js 14 App Router
Logic:
- ถ้าไม่มี session → redirect /login
- ถ้า session ไม่มี Member → redirect /onboarding
- ถ้า Member.status = PENDING → redirect /pending
- ถ้า Member.status = INACTIVE → redirect /deactivated
- ถ้าเข้า /admin/* แต่ role ไม่ใช่ GUILD_MASTER หรือ VICE_MASTER → redirect /dashboard
- ถ้า route เป็น public (/, /api/auth/*) → ผ่านได้

สร้าง lib/rbac.ts
- requireRole(role: Role | Role[]) → throws unauthorized ถ้าไม่ตรง
- checkRole(session, role) → boolean
```

---

## Git Commands สำหรับ Sprint 0

```bash
# เริ่ม sprint
git checkout -b develop
git push -u origin develop

# Task 1
git checkout -b feat/project-init develop
# ... สร้างไฟล์ ...
git add . && git commit -m "feat: initial Next.js 14 project setup"
git push origin feat/project-init
# เปิด PR → develop

# Task 2
git checkout -b feat/db-schema develop
# ... สร้าง schema ...
git add . && git commit -m "feat: complete Prisma schema with season_id and leave status"
git push origin feat/db-schema

# Task 3
git checkout -b feat/auth-discord develop
git add . && git commit -m "feat: Auth.js Discord provider with Prisma adapter"
git push origin feat/auth-discord

# Task 4
git checkout -b feat/rbac-middleware develop
git add . && git commit -m "feat: RBAC middleware and route protection"
git push origin feat/rbac-middleware

# จบ Sprint 0 — merge ทุก PR → develop แล้วค่อย:
git checkout main
git merge develop
git tag v0.0.0
git push origin main --tags
```

---

## Definition of Done (Sprint 0)

- [ ] Next.js 14 run ได้ใน local
- [ ] Prisma schema migrate ได้ไม่มี error
- [ ] Login ด้วย Discord แล้วสร้าง User + Account ได้
- [ ] Middleware redirect ถูกต้องทุก case
- [ ] `.env.example` มี variables ครบ
