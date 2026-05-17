# 🗄️ Database Schema — Guild Management App

> ไฟล์นี้อธิบาย schema ที่ถูกต้องทั้งหมด รวมถึง constraints และ decisions ที่สำคัญ

---

## Schema Overview (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Auth.js Required Models ───────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  discordId     String?   @unique
  accounts      Account[]
  sessions      Session[]
  member        Member?
}

model Account { ... }  // Auth.js standard
model Session { ... }  // Auth.js standard

// ─── Core Models ───────────────────────────────────────────

model Member {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])
  inGameName   String
  nickname     String
  role         Role     @default(MEMBER)
  status       Status   @default(PENDING)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  questLogs    QuestLog[]
  warLogs      WarLog[]
  leaveReqs    LeaveRequest[]
  redeemLogs   RedeemLog[]
  auditLogs    AuditLog[]     @relation("AuditActor")
}

enum Role   { GUILD_MASTER VICE_MASTER MEMBER }
enum Status { PENDING ACTIVE INACTIVE }

// ─── Season ────────────────────────────────────────────────

model GuildSeason {
  id         String   @id @default(cuid())
  // ใช้ "2026-05" format (YYYY-MM) เพื่อให้ sort ถูกต้อง
  monthYear  String   @unique
  isOpen     Boolean  @default(false)
  createdAt  DateTime @default(now())
  closedAt   DateTime?

  questLogs  QuestLog[]
  warLogs    WarLog[]
  leaveReqs  LeaveRequest[]
  snapshot   SeasonSnapshot?

  // Partial Unique Index: เปิดได้ทีละ season เดียว
  // สร้างใน migration SQL:
  // CREATE UNIQUE INDEX only_one_open_season ON "GuildSeason" (is_open) WHERE is_open = true;
}

// ─── Quest & War Logs ──────────────────────────────────────

model QuestLog {
  id            String      @id @default(cuid())
  memberId      String
  member        Member      @relation(fields: [memberId], references: [id])
  seasonId      String                          // ← สำคัญมาก!
  season        GuildSeason @relation(fields: [seasonId], references: [id])
  date          DateTime    @db.Date
  status        QuestStatus
  proofImageUrl String?
  createdAt     DateTime    @default(now())
  createdBy     String?     // admin id ที่กดบันทึก

  @@unique([memberId, date, seasonId])          // ป้องกัน log ซ้ำ
}

enum QuestStatus { DONE ABSENT LEAVE }

model WarLog {
  id        String      @id @default(cuid())
  memberId  String
  member    Member      @relation(fields: [memberId], references: [id])
  seasonId  String                              // ← สำคัญมาก!
  season    GuildSeason @relation(fields: [seasonId], references: [id])
  date      DateTime    @db.Date
  status    WarStatus
  createdAt DateTime    @default(now())

  @@unique([memberId, date, seasonId])          // ป้องกัน log ซ้ำ
}

enum WarStatus { ATTENDED MISSED }

// ─── Leave Request ────────────────────────────────────────

model LeaveRequest {
  id           String        @id @default(cuid())
  memberId     String
  member       Member        @relation(fields: [memberId], references: [id])
  seasonId     String
  season       GuildSeason   @relation(fields: [seasonId], references: [id])
  date         DateTime      @db.Date
  reason       String
  status       LeaveStatus   @default(PENDING)   // ← ต้องมี!
  reviewedBy   String?       // admin id
  reviewedAt   DateTime?
  createdAt    DateTime      @default(now())

  @@unique([memberId, date, seasonId])
}

enum LeaveStatus { PENDING APPROVED REJECTED }

// ─── Shop ────────────────────────────────────────────────

model ShopItem {
  id          String       @id @default(cuid())
  name        String
  description String?
  price       Int          // points
  stock       Int          @default(0)
  imageUrl    String?
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  redeemLogs  RedeemLog[]
}

model RedeemLog {
  id          String       @id @default(cuid())
  memberId    String
  member      Member       @relation(fields: [memberId], references: [id])
  itemId      String
  item        ShopItem     @relation(fields: [itemId], references: [id])
  pointsSpent Int          // snapshot ราคา ณ วันที่ redeem
  status      RedeemStatus @default(PENDING)
  redeemedAt  DateTime     @default(now())
  deliveredAt DateTime?
  deliveredBy String?
}

enum RedeemStatus { PENDING DELIVERED }

// ─── Season Snapshot (สำหรับ Season Recap) ──────────────

model SeasonSnapshot {
  id          String      @id @default(cuid())
  seasonId    String      @unique
  season      GuildSeason @relation(fields: [seasonId], references: [id])
  data        Json        // { mvp, topMembers, stats, ... }
  createdAt   DateTime    @default(now())
}

// ─── Audit Log ───────────────────────────────────────────

model AuditLog {
  id          String   @id @default(cuid())
  actorId     String   // admin ที่ทำ action
  actor       Member   @relation("AuditActor", fields: [actorId], references: [id])
  action      String   // "APPROVE_MEMBER", "BULK_ABSENT", "UPDATE_LOG", ...
  targetType  String   // "Member", "QuestLog", "ShopItem", ...
  targetId    String
  oldValue    Json?
  newValue    Json?
  createdAt   DateTime @default(now())
}

// ─── Notification Log ────────────────────────────────────

model NotificationLog {
  id        String   @id @default(cuid())
  memberId  String
  type      String   // "APPROVED", "WATCHLIST_ALERT", "ITEM_REDEEMABLE"
  payload   Json
  sentAt    DateTime @default(now())
  success   Boolean  @default(true)
}
```

---

## 🔑 Constraints ที่ต้องสร้าง Manual (Migration SQL)

```sql
-- 1. เปิด Season ได้ทีละอันเดียว
CREATE UNIQUE INDEX only_one_open_season
ON "GuildSeason" (is_open)
WHERE is_open = true;

-- 2. ป้องกัน QuestLog ซ้ำ (สร้างจาก @@unique ใน schema แล้ว)
-- 3. ป้องกัน WarLog ซ้ำ (สร้างจาก @@unique ใน schema แล้ว)
-- 4. ป้องกัน LeaveRequest ซ้ำในวันเดียวกัน (สร้างจาก @@unique แล้ว)
```

---

## 🧮 Points Calculation — Real-time (ไม่ store column)

```typescript
// lib/points.ts

const POINTS = {
  QUEST_DONE: 10,
  WAR_ATTENDED: 50,
} as const;

export async function getMemberPoints(memberId: string, seasonId?: string) {
  const where = seasonId ? { memberId, seasonId } : { memberId };

  const [questPoints, warPoints, redeemed] = await Promise.all([
    prisma.questLog.count({ where: { ...where, status: 'DONE' } }),
    prisma.warLog.count({ where: { ...where, status: 'ATTENDED' } }),
    prisma.redeemLog.aggregate({
      where: { memberId },
      _sum: { pointsSpent: true },
    }),
  ]);

  const earned = (questPoints * POINTS.QUEST_DONE) + (warPoints * POINTS.WAR_ATTENDED);
  const spent  = redeemed._sum.pointsSpent ?? 0;

  return { earned, spent, total: earned - spent };
}
```

---

## 🛒 Shop Redeem — Atomic Transaction

```typescript
// actions/shop.ts

export async function redeemItem(memberId: string, itemId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Lock and decrement stock atomically
    const item = await tx.$queryRaw<ShopItem[]>`
      UPDATE "ShopItem"
      SET stock = stock - 1
      WHERE id = ${itemId} AND stock > 0
      RETURNING *
    `;

    if (item.length === 0) {
      throw new Error("OUT_OF_STOCK");
    }

    // 2. Check member points
    const points = await getMemberPoints(memberId);
    if (points.total < item[0].price) {
      throw new Error("INSUFFICIENT_POINTS");
    }

    // 3. Create redeem log
    const log = await tx.redeemLog.create({
      data: {
        memberId,
        itemId,
        pointsSpent: item[0].price,
        status: 'PENDING',
      },
    });

    return log;
  });
}
```

---

## 📊 Entity Relationship Diagram

```
User ──(1:1)── Member
                  │
         ┌────────┼────────┬──────────┐
         │        │        │          │
     QuestLog  WarLog  LeaveReq  RedeemLog
         │        │        │          │
         └────────┴────────┘          │
                  │                ShopItem
            GuildSeason
                  │
           SeasonSnapshot
```

---

## ⚠️ Design Decisions

| Decision | เหตุผล |
|----------|--------|
| `monthYear` เป็น `String "2026-05"` | YYYY-MM sort ถูกต้อง, human-readable |
| ไม่มี `total_points` column | คำนวณ real-time ป้องกัน inconsistency |
| LeaveRequest มี 3 status | Bulk Absent ใช้เฉพาะ APPROVED |
| `season_id` อยู่ใน QuestLog/WarLog | แยก data ต่าม season ได้ถูกต้อง |
| `pointsSpent` ใน RedeemLog | snapshot ราคา ณ วันที่ซื้อ ไม่ผันผวนตาม item |
