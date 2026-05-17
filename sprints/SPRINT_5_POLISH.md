# Sprint 5 — Polish, Extras, Dark Mode

> เป้าหมาย: Season Recap, Audit Log, Dark Mode, พร้อม production

## Tasks & Branches

### `feat/season-recap`
ดู spec ใน SYSTEMS.md ระบบที่ 9

### `feat/audit-log`
**Prompt:**
```
สร้าง lib/audit.ts
export function logAction(params: {
  actorId: string
  action: string
  targetType: string
  targetId: string
  oldValue?: object
  newValue?: object
})
→ สร้าง AuditLog record
สร้าง app/(admin)/audit/page.tsx แสดง audit log ทั้งหมด filter ตาม action, actor, วันที่
```

### `feat/season-snapshot`
**Prompt:**
```
แก้ closeSeason() ใน app/(admin)/seasons/actions.ts
เพิ่ม logic คำนวณและ save SeasonSnapshot:
- mvp: member ที่ points สูงสุดในฤดูกาล
- perfectAttendance: member ที่ Quest Done ทุกวันที่มี log
- atRisk: member ที่ absent rate > 50%
- totalQuestDays: จำนวนวันที่มี quest log ใน season
```

### `feat/dark-mode`
**Prompt:**
```
ตั้งค่า Dark Mode สำหรับ Guild App
- ใช้ next-themes สำหรับ toggle
- Dark: bg #0F0F14, surface #1A1A24, text #E2E8F0
- Light: bg #FAFAFA, surface #FFFFFF, text #111827
- สร้าง ThemeToggle component ใน components/ui/ThemeToggle.tsx
- ใส่ใน navbar
- เช็ค accessibility: contrast ratio ทุก color ผ่าน WCAG AA
```

---

## Git Commands (Sprint 5)

```bash
git checkout -b feat/season-recap develop
git checkout -b feat/audit-log develop
git checkout -b feat/season-snapshot develop
git checkout -b feat/dark-mode develop

# Release 1.0
git checkout main && git merge develop && git tag v1.0.0 && git push origin main --tags
```

---

## Pre-Launch Checklist

- [ ] ทุก server action มี error handling
- [ ] ทุก admin route มี RBAC check
- [ ] Shop redeem ผ่าน stress test (race condition)
- [ ] Discord notify ทดสอบ DM ได้จริง
- [ ] Prisma Partial Unique Index บน GuildSeason ใส่แล้ว
- [ ] .env.example ครบ ไม่มี secret จริงใน repo
- [ ] README อัปเดตล่าสุด
