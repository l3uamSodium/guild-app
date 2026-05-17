# Sprint 3 — War Log, Points Engine, Leaderboard

> เป้าหมาย: ระบบ war, points, leaderboard, watchlist ครบ

## Tasks & Branches

### `feat/war-log`
**Files:** `app/(admin)/war-log/page.tsx`, `app/(admin)/war-log/actions.ts`

**Prompt:**
```
สร้าง War Log admin page ใน app/(admin)/war-log/page.tsx
- เลือกวันที่ (ล็อคกับ open season)
- แสดง ACTIVE members ทั้งหมด
- toggle แต่ละคน: ATTENDED / MISSED (default MISSED)
- ปุ่ม "Save All" → createWarLogs() หลายรายการ
- ถ้า log วันนั้นมีอยู่แล้ว → แสดงค่าเดิม (edit mode)
```

---

### `feat/points-engine`
**Files:** `lib/points.ts`, `lib/leaderboard.ts`

**Prompt:**
```
สร้าง lib/points.ts
getMemberPoints(memberId, seasonId?) → { earned, spent, total }
- Quest Done × 10
- War Attended × 50
- ลบด้วย redeemLogs.pointsSpent ที่ status=DELIVERED หรือ PENDING
- ถ้าส่ง seasonId → คำนวณเฉพาะ season นั้น

สร้าง lib/leaderboard.ts
getLeaderboard(currentMemberId, seasonId)
- คำนวณคะแนนทุก ACTIVE member
- เรียง desc
- ใส่ rank และ isCurrentUser flag
ใช้ Prisma aggregate ให้ query น้อยที่สุด
```

---

### `feat/leaderboard`
**Files:** `app/(member)/leaderboard/page.tsx`

**Prompt:**
```
สร้าง Leaderboard page ใน app/(member)/leaderboard/page.tsx
- แสดง top members เรียงตามคะแนน
- row ของ current user → highlight สีต่างออกไป
- ถ้า current user ไม่อยู่ใน top 10 → แสดงตำแหน่งของตัวเองแยกไว้ด้านล่าง
- crown icon สำหรับ top 3
- filter: season (dropdown)
```

---

### `feat/watchlist`
**Files:** `app/(admin)/watchlist/page.tsx`, `lib/watchlist.ts`

**Prompt:**
```
สร้าง lib/watchlist.ts และ Admin Watchlist page
ตาม spec ใน SYSTEMS.md ระบบที่ 6 ทุกอย่าง
page แสดง 2 section:
- "ขาดบ่อย (7 วัน)" — แสดง member, จำนวนวันที่ขาด, วันที่ขาด
- "Leave มาก (season นี้)" — เรียง desc
```

---

## Git Commands (Sprint 3)

```bash
git checkout -b feat/war-log develop
git checkout -b feat/points-engine develop
git checkout -b feat/leaderboard develop
git checkout -b feat/watchlist develop

git checkout main && git merge develop && git tag v0.3.0 && git push origin main --tags
```
