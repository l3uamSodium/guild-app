# Sprint 2 — Quest & Leave System

> เป้าหมาย: ระบบ Season, Leave Request, และ Bulk Absent ทำงานได้ครบ

## Tasks & Branches

### `feat/season-management`
**Files:** `app/(admin)/seasons/page.tsx`, `app/(admin)/seasons/actions.ts`, `lib/season.ts`

**Prompt:**
```
สร้าง Season management ใน app/(admin)/seasons/
- แสดง seasons ทั้งหมด (list)
- ปุ่ม "เปิด Season ใหม่" (เฉพาะ GUILD_MASTER) → openSeason(monthYear)
  * เช็คว่าไม่มี season เปิดอยู่แล้ว
  * สร้าง GuildSeason isOpen=true
- ปุ่ม "ปิด Season" → closeSeason() → trigger SeasonSnapshot
สร้าง lib/season.ts: getCurrentSeason() → return open GuildSeason หรือ null
```

---

### `feat/leave-request`
**Files:** `app/(member)/leave/page.tsx`, `app/(admin)/leave/page.tsx`, actions

**Prompt:**
```
สร้าง Leave Request system:

Member side (app/(member)/leave/page.tsx):
- form: เลือกวันที่ (date picker), reason (textarea)
- ส่ง createLeaveRequest() → สร้าง LeaveRequest status=PENDING
- แสดงประวัติ leaves ของตัวเองในเดือนนี้

Admin side (app/(admin)/leave/page.tsx):
- ตาราง PENDING leaves ทั้งหมด
- ปุ่ม Approve → status=APPROVED + reviewedBy + reviewedAt
- ปุ่ม Reject → status=REJECTED
- filter ตาม member, วันที่
```

---

### `feat/bulk-absent`
**Files:** `actions/questLog.ts`

**Prompt:**
```
สร้าง server action bulkAbsent(date: Date, seasonId: string)
ใน actions/questLog.ts
Logic ที่ต้องใช้ตาม SYSTEMS.md:
1. ดึง ACTIVE members ทั้งหมด
2. หา member ที่มี APPROVED LeaveRequest วันนั้น → excludeIds
3. หา member ที่มี QuestLog วันนั้น season นี้อยู่แล้ว → skipIds
4. filteredMembers = ACTIVE - excludeIds - skipIds
5. createMany QuestLog status=ABSENT
6. บันทึก AuditLog
7. return { created, skipped, excluded }
```

---

### `feat/quest-check-ui`
**Files:** `app/(admin)/quest-check/page.tsx`

**Prompt:**
```
สร้าง Quest Check command center ใน app/(admin)/quest-check/page.tsx
Single page layout:
- เลือกวันที่
- drag-and-drop upload screenshot (image only)
- แสดง checklist ของ ACTIVE members:
  * tick = Done, untick = จะเป็น Absent
  * members ที่มี APPROVED Leave → แสดงแยก badge "Leave"
- summary: "จะบันทึก Absent X คน, Skip (Leave) Y คน"
- ปุ่ม "Confirm & Save"
ใช้ Shadcn UI, Tailwind CSS
```

---

## Git Commands (Sprint 2)

```bash
git checkout -b feat/season-management develop
git checkout -b feat/leave-request develop
git checkout -b feat/bulk-absent develop
git checkout -b feat/quest-check-ui develop

# จบ Sprint 2
git checkout main && git merge develop && git tag v0.2.0 && git push origin main --tags
```
