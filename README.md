# ⚔️ Guild Management App

> Web application สำหรับจัดการ guild เกม — ย้ายจาก Google Sheets สู่ระบบเต็มรูปแบบ

**Tech Stack:** Next.js 14 (App Router) · PostgreSQL · Prisma ORM · Auth.js (Discord) · Tailwind CSS · Shadcn UI

---

## 📁 โครงสร้าง Project

```
guild-app/
├── app/
│   ├── (public)/           # Landing page (Oni Girl theme)
│   ├── (auth)/             # Onboarding, Pending
│   ├── (member)/           # Dashboard, Leaderboard, Shop, Leave
│   └── (admin)/            # Admin panels ทั้งหมด
├── actions/                # Server Actions แยกตามระบบ
├── lib/                    # Utilities (rbac, points, discord-notify, audit)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── components/
│   ├── ui/                 # Shadcn components
│   └── features/           # Feature-specific components
└── docs/
    ├── SYSTEMS.md           # อธิบาย business logic แต่ละระบบ
    └── DB_SCHEMA.md         # อธิบาย schema + constraint ทั้งหมด
```

---

## 🌿 Git Branch Strategy

```
main          ← production, stable, tag ต่อ sprint
  └─ develop  ← integration branch
       └─ feat/[system-name]   ← 1 branch ต่อ 1 task/ระบบ
       └─ fix/[issue-name]     ← hotfix (merge main ได้โดยตรงถ้าด่วน)
```

### Workflow ทุก task
```bash
git checkout develop
git checkout -b feat/[ชื่อ-task]
# ... เขียน code ...
git add .
git commit -m "feat: [ชื่อ task] - [สิ่งที่ทำ]"
git push origin feat/[ชื่อ-task]
# → เปิด Pull Request → develop
# เมื่อสิ้นสุด sprint → merge develop → main → git tag v0.x.0
```

### Commit Message Convention
```
feat:   เพิ่ม feature ใหม่
fix:    แก้ bug
chore:  config, dependency, เรื่องที่ไม่ใช่ logic
refactor: ปรับ code โดยไม่เปลี่ยน behavior
docs:   แก้ไข documentation
```

---

## 🗺️ Sprint Roadmap

| Sprint | ชื่อ | สิ่งที่สร้าง | Branch หลัก |
|--------|------|-------------|-------------|
| **0** | Foundation | Project init, Prisma schema, Auth setup, RBAC | `feat/project-init`, `feat/db-schema`, `feat/auth-discord`, `feat/rbac-middleware` |
| **1** | Onboarding | Onboarding form, Pending page, Admin approve, Landing | `feat/onboarding-form`, `feat/pending-page`, `feat/admin-approve`, `feat/landing-page` |
| **2** | Quest System | Season management, Leave request, Bulk absent, Quest UI | `feat/season-management`, `feat/leave-request`, `feat/bulk-absent`, `feat/quest-check-ui` |
| **3** | War + Points | War log, Points engine, Leaderboard, Watchlist | `feat/war-log`, `feat/points-engine`, `feat/leaderboard`, `feat/watchlist` |
| **4** | Shop + Member | Shop redeem (atomic), Admin CRUD, Member dashboard, Discord notify | `feat/shop-redeem`, `feat/shop-admin`, `feat/member-dashboard`, `feat/discord-notify` |
| **5** | Polish | Season recap, Audit log, Season snapshot, Dark mode | `feat/season-recap`, `feat/audit-log`, `feat/season-snapshot`, `feat/dark-mode` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Discord Application (Client ID + Secret)

### Setup
```bash
# 1. Clone และติดตั้ง dependencies
git clone [repo-url]
cd guild-app
npm install

# 2. ตั้งค่า environment variables
cp .env.example .env
# แก้ไข .env ตาม config ของคุณ

# 3. รัน database migration
npx prisma migrate dev

# 4. (Optional) Seed ข้อมูลทดสอบ
npx prisma db seed

# 5. รัน development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/guild_db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
DISCORD_BOT_TOKEN="your-bot-token"       # สำหรับ DM notifications
DISCORD_WEBHOOK_URL="your-webhook-url"   # สำหรับ Season Recap
```

---

## 👥 Roles & Permissions (RBAC)

| Role | ทำได้ |
|------|--------|
| **Guild Master** | ทุกอย่าง + เปิด/ปิด Season, Season Recap |
| **Vice Master** | Approve members, Quest check, War log, Watchlist |
| **Member** | ดู dashboard ตัวเอง, ยื่น Leave, Redeem shop |
| **Unlinked/Guest** | เห็นเฉพาะ Landing page, ทำ Onboarding |

---

## 📚 เอกสารแต่ละระบบ

ดูไฟล์แยกใน `docs/` สำหรับรายละเอียด business logic:

- [`docs/SYSTEMS.md`](docs/SYSTEMS.md) — อธิบาย logic ทุกระบบ
- [`docs/DB_SCHEMA.md`](docs/DB_SCHEMA.md) — Schema diagram + constraints

---

## ⚠️ Critical Architecture Decisions

1. **`season_id` ต้องมีใน QuestLog และ WarLog** — ไม่เช่นนั้นแยก season ไม่ได้
2. **Shop redeem ต้องใช้ Atomic Transaction** — ป้องกัน race condition
3. **LeaveRequest ต้องมี status** (PENDING/APPROVED/REJECTED) — Bulk Absent ใช้เฉพาะ APPROVED
4. **Points คำนวณ real-time จาก logs** — ไม่ store เป็น column เดี่ยว (ป้องกัน inconsistency)
5. **GuildSeason เปิดได้ครั้งเดียว** — ใช้ Partial Unique Index บน `is_open = true`
