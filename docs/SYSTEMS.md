# ⚙️ Systems — Business Logic Guide

> อธิบาย logic แต่ละระบบ พร้อม edge cases และ prompt สำหรับสั่ง AI สร้างโค้ด

---

## ระบบที่ 1: Auth & Onboarding
**Branch:** `feat/auth-discord` → `feat/onboarding-form` → `feat/pending-page` → `feat/admin-approve`

### Flow
```
User กด Login Discord
  ↓
Auth.js สร้าง User + Account (auto)
  ↓
Middleware เช็ค: มี Member record ไหม?
  ├─ ไม่มี → redirect /onboarding
  ├─ PENDING → redirect /pending
  ├─ INACTIVE → redirect /banned
  └─ ACTIVE → redirect /dashboard
```

### Files ที่ต้องสร้าง
```
app/(auth)/onboarding/page.tsx     ← form: inGameName, nickname
app/(auth)/onboarding/actions.ts   ← server action: createMember()
app/(auth)/pending/page.tsx        ← "รอ Admin approve" + discord webhook
app/(admin)/members/page.tsx       ← ตาราง PENDING members
app/(admin)/members/actions.ts     ← approveMember(), deactivateMember()
middleware.ts                      ← route guard ทุก path
lib/rbac.ts                        ← helper: checkRole(), requireRole()
```

### Edge Cases
- User submit form 2 ครั้ง → `createMember()` ต้อง check `userId` ก่อนสร้าง
- Admin approve แล้ว ส่ง Discord DM แจ้ง member ทันที
- INACTIVE member พยายาม login → แสดงหน้าแจ้งว่าถูก deactivate

### Prompt สำหรับสั่ง AI
```
สร้าง Next.js 14 App Router server action ชื่อ createMember()
ใน file: app/(auth)/onboarding/actions.ts
- รับ: inGameName (string), nickname (string)
- ดึง session จาก Auth.js เพื่อเอา userId
- เช็คว่ามี Member ที่ userId นี้แล้วหรือยัง ถ้ามีให้ return error
- สร้าง Member ด้วย status PENDING, role MEMBER
- redirect ไปหน้า /pending
ใช้ Prisma ORM, zod สำหรับ validate input
```

---

## ระบบที่ 2: Season Management
**Branch:** `feat/season-management`

### Rules
- เปิด Season ได้ทีละ 1 เท่านั้น (enforce ด้วย Partial Unique Index)
- เฉพาะ GUILD_MASTER เท่านั้นที่เปิด/ปิด Season ได้
- เมื่อปิด Season → trigger สร้าง `SeasonSnapshot` อัตโนมัติ
- Quest/Leave/War ทุกอย่างต้องผูกกับ open season → ถ้าไม่มี open season ให้ disable

### Files ที่ต้องสร้าง
```
app/(admin)/seasons/page.tsx
app/(admin)/seasons/actions.ts    ← openSeason(), closeSeason()
app/(admin)/seasons/recap/page.tsx
lib/season.ts                     ← getCurrentSeason() helper
```

### Prompt สำหรับสั่ง AI
```
สร้าง server action closeSeason() ใน app/(admin)/seasons/actions.ts
- เช็ค role ต้องเป็น GUILD_MASTER เท่านั้น
- set isOpen = false, closedAt = now() ใน GuildSeason
- คำนวณ season stats แล้ว save ลง SeasonSnapshot.data (JSON):
  { mvp: { memberId, points }, totalMembers, perfectAttendance: [memberId[]], atRisk: [memberId[]] }
- ใช้ Prisma transaction
```

---

## ระบบที่ 3: Quest & Leave System
**Branch:** `feat/leave-request` → `feat/bulk-absent` → `feat/quest-check-ui`

### Leave Request Flow
```
Member ยื่น Leave Request (date, reason)
  ↓ status: PENDING
Admin review → APPROVED หรือ REJECTED
  ↓
Bulk Absent เช็คเฉพาะ APPROVED leaves
```

### Bulk Absent Logic
```typescript
// actions/questLog.ts — bulkAbsent()

1. รับ: date, seasonId
2. ดึง members ที่ status = ACTIVE ทั้งหมด
3. ดึง APPROVED leaves วันนั้น → ได้ excludedMemberIds
4. ดึง QuestLog ที่มีอยู่แล้ววันนั้น → ได้ alreadyLoggedIds
5. filteredMembers = ACTIVE - excludedMemberIds - alreadyLoggedIds
6. prisma.questLog.createMany() ด้วย status ABSENT
7. บันทึก AuditLog
```

### Files ที่ต้องสร้าง
```
app/(member)/leave/page.tsx         ← form ยื่น leave
app/(member)/leave/actions.ts       ← createLeaveRequest()
app/(admin)/leave/page.tsx          ← ตาราง pending leaves
app/(admin)/leave/actions.ts        ← approveLeave(), rejectLeave()
app/(admin)/quest-check/page.tsx    ← command center (upload + bulk absent)
actions/questLog.ts                 ← bulkAbsent(), createQuestLog()
```

### Prompt สำหรับสั่ง AI
```
สร้าง server action bulkAbsent() ใน actions/questLog.ts
- รับ: date (Date), seasonId (string)
- เช็ค role ต้องเป็น VICE_MASTER หรือ GUILD_MASTER
- ดึง ACTIVE members ที่ไม่มี APPROVED LeaveRequest วันนั้น
  และยังไม่มี QuestLog วันนั้นใน season นี้
- สร้าง QuestLog หลายรายการด้วย createMany() status ABSENT
- return { created: number, skipped: number }
ใช้ Prisma, ใส่ error handling ครบถ้วน
```

---

## ระบบที่ 4: War Log
**Branch:** `feat/war-log`

### Files ที่ต้องสร้าง
```
app/(admin)/war-log/page.tsx
app/(admin)/war-log/actions.ts   ← createWarLog(), bulkWarAbsent()
```

### Prompt สำหรับสั่ง AI
```
สร้าง admin page สำหรับบันทึก War Log
ใน app/(admin)/war-log/page.tsx
- เลือกวันที่ + season (auto ใช้ open season)
- แสดง list ของ ACTIVE members ทั้งหมด
- แต่ละ member มี toggle: ATTENDED / MISSED
- กด Save → server action createWarLog() บันทึกทีละ member
ใช้ Shadcn UI, Tailwind CSS, Prisma
```

---

## ระบบที่ 5: Points Engine
**Branch:** `feat/points-engine`

### Design Decision: Real-time Calculation
- ไม่เก็บ `total_points` เป็น column (เพื่อป้องกัน inconsistency)
- คำนวณทุกครั้งจาก QuestLog + WarLog - RedeemLog
- ถ้า member มาก (>200) → ใช้ materialized view หรือ cache

### Files ที่ต้องสร้าง
```
lib/points.ts          ← getMemberPoints(), getMemberSeasonPoints()
lib/leaderboard.ts     ← getLeaderboard() พร้อม self-rank
```

### Prompt สำหรับสั่ง AI
```
สร้าง lib/leaderboard.ts
export function getLeaderboard(currentMemberId: string, seasonId: string)
- ดึง ACTIVE members ทั้งหมด
- คำนวณคะแนนแต่ละคน (Quest Done × 10) + (War Attended × 50) - redeemed points
- เรียงลำดับ desc
- return: { rank, member, points, isCurrentUser: boolean }[]
ใช้ Prisma raw query หรือ aggregate ให้ efficient ที่สุด
```

---

## ระบบที่ 6: Admin Watchlist
**Branch:** `feat/watchlist`

### Watchlist Types
```
Type A — Frequent Absentees:
  ACTIVE members ที่มี QuestLog status=ABSENT >= 3 ครั้ง
  ในช่วง 7 วันย้อนหลัง (rolling window ไม่ใช่ calendar week)

Type B — High Leave Takers:
  เรียง ACTIVE members ตามจำนวน APPROVED LeaveRequest season นี้ (desc)
```

### Files ที่ต้องสร้าง
```
app/(admin)/watchlist/page.tsx
lib/watchlist.ts   ← getAbsentees(), getHighLeaveTakers()
```

### Prompt สำหรับสั่ง AI
```
สร้าง lib/watchlist.ts
export function getAbsentees(seasonId: string, threshold = 3, days = 7)
  - หา ACTIVE members ที่มี QuestLog ABSENT >= threshold ครั้ง
    ใน 7 วันที่ผ่านมา (นับจากวันนี้ backward)
  - return: { member, absentCount, dates: Date[] }[]

export function getHighLeaveTakers(seasonId: string)
  - นับ APPROVED LeaveRequest ต่อ member ใน season นี้
  - เรียง desc
  - return: { member, leaveCount }[]
```

---

## ระบบที่ 7: Shop & Economy
**Branch:** `feat/shop-redeem` → `feat/shop-admin`

### Atomic Transaction (Critical)
ดูรายละเอียดใน `DB_SCHEMA.md` section "Shop Redeem — Atomic Transaction"

### Files ที่ต้องสร้าง
```
app/(member)/shop/page.tsx          ← grid items + canAfford state
app/(member)/shop/actions.ts        ← redeemItem() atomic
app/(admin)/shop/page.tsx           ← CRUD + redeem logs
app/(admin)/shop/actions.ts         ← createItem(), updateItem(), markDelivered()
```

### Prompt สำหรับสั่ง AI
```
สร้าง member shop page ใน app/(member)/shop/page.tsx
- แสดง ShopItem ที่ isActive = true เป็น card grid
- แต่ละ card แสดง: ชื่อ, ราคา (points), stock
- เช็ค member points แล้ว:
  ถ้า points พอและ stock > 0 → ปุ่ม "Redeem" สีปกติ
  ถ้า points ไม่พอ → ปุ่ม disabled + แสดง "ขาด X pts"
  ถ้า stock = 0 → badge "หมดแล้ว"
- กด Redeem → เรียก redeemItem() server action → แสดง toast
ใช้ Shadcn UI Card, Tailwind CSS
```

---

## ระบบที่ 8: Discord Notifications
**Branch:** `feat/discord-notify`

### Trigger Events
| Event | ส่งหา | Message |
|-------|-------|---------|
| Admin approve member | Member | "ยินดีต้อนรับ! คุณถูก approve แล้ว ⚔️" |
| Member เข้า watchlist | Guild Master | "แจ้งเตือน: [ชื่อ] ขาด 3 วันใน 7 วัน" |
| Points พอ redeem item | Member | "คะแนนพอแล้ว! [item] รอคุณอยู่ 🎁" |
| Season ปิด | All | Season recap summary |

### Files ที่ต้องสร้าง
```
lib/discord-notify.ts   ← sendDM(), sendWebhook()
```

### Prompt สำหรับสั่ง AI
```
สร้าง lib/discord-notify.ts
export async function sendDM(discordUserId: string, message: string)
  - ใช้ Discord Bot Token จาก env
  - POST https://discord.com/api/v10/users/@me/channels → ได้ channelId
  - POST https://discord.com/api/v10/channels/{channelId}/messages
  - บันทึก NotificationLog ลง DB ทุกครั้ง (success/fail)
  - ไม่ throw error ถ้า Discord fail → log และ return false

export async function sendWebhook(webhookUrl: string, embed: object)
  - ส่ง Discord embed ไปยัง webhook URL
```

---

## ระบบที่ 9: Season Recap
**Branch:** `feat/season-recap`

### Files ที่ต้องสร้าง
```
app/(admin)/seasons/recap/page.tsx   ← แสดง recap + export button
app/(admin)/seasons/recap/actions.ts ← generateRecap(), exportImage()
```

### Prompt สำหรับสั่ง AI
```
สร้าง Season Recap page ใน app/(admin)/seasons/recap/page.tsx
- ดึงข้อมูลจาก SeasonSnapshot.data ของ season ที่เลือก
- แสดง: MVP (ชื่อ + คะแนน), Perfect Attendance, At-Risk members
- ปุ่ม "Export PNG" → ใช้ html2canvas แปลง div เป็นรูป → download
- ปุ่ม "Post to Discord" → เรียก sendWebhook() ส่ง embed
ใช้ Tailwind CSS ออกแบบให้สวยสำหรับ share บน Discord
```

---

## ระบบที่ 10: Member Personal Dashboard
**Branch:** `feat/member-dashboard`

### Features
- Calendar view แสดง quest status ทุกวัน (Done/Absent/Leave/ไม่มี log)
- Stats: attendance rate, war rate, leave count
- Leaderboard rank ของตัวเอง
- Items ที่ redeem ได้ตอนนี้ (points พอ + stock > 0)

### Files ที่ต้องสร้าง
```
app/(member)/dashboard/page.tsx
components/features/QuestCalendar.tsx
components/features/StatsCard.tsx
```

### Prompt สำหรับสั่ง AI
```
สร้าง Quest Calendar component ใน components/features/QuestCalendar.tsx
- รับ props: month (Date), questLogs (QuestLog[]), leaveRequests (LeaveRequest[])
- แสดง calendar grid ของเดือน
- แต่ละวันแสดง icon/color:
  ✓ เขียว = DONE
  ✗ แดง = ABSENT
  L เหลือง = LEAVE (approved)
  ○ เทา = ไม่มี log (วันในอนาคตหรือยังไม่บันทึก)
ใช้ Tailwind CSS, ไม่ต้องใช้ library calendar ภายนอก
```

---

## 📋 สรุป Prompt Template สำหรับทุก task

```
สร้าง [ชนิด file] ใน [path]
เงื่อนไข/requirements:
- [requirement 1]
- [requirement 2]
ใช้: Next.js 14 App Router, Prisma, Tailwind CSS, Shadcn UI
รูปแบบ: TypeScript strict, ไม่มี any
```
