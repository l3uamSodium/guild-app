# Sprint 4 — Shop, Member Dashboard, Discord Notify

> เป้าหมาย: ระบบ shop atomic, member dashboard ครบ, Discord DM ทำงานได้

## Tasks & Branches

### `feat/shop-redeem`
**Files:** `app/(member)/shop/page.tsx`, `app/(member)/shop/actions.ts`
ดู spec ใน DB_SCHEMA.md และ SYSTEMS.md ระบบที่ 7

### `feat/shop-admin`
**Files:** `app/(admin)/shop/page.tsx`, `app/(admin)/shop/actions.ts`

**Prompt:**
```
สร้าง Admin Shop management ใน app/(admin)/shop/
- CRUD ShopItem: ชื่อ, ราคา, stock, image upload
- ตาราง RedeemLog ทั้งหมด: member, item, วันที่, status
- ปุ่ม "Mark Delivered" → set status=DELIVERED + deliveredAt + deliveredBy
- filter by status (PENDING / DELIVERED)
```

### `feat/member-dashboard`
**Files:** `app/(member)/dashboard/page.tsx`, `components/features/QuestCalendar.tsx`
ดู spec ใน SYSTEMS.md ระบบที่ 10

### `feat/discord-notify`
**Files:** `lib/discord-notify.ts`
ดู spec ใน SYSTEMS.md ระบบที่ 8

---

## Git Commands (Sprint 4)

```bash
git checkout -b feat/shop-redeem develop
git checkout -b feat/shop-admin develop
git checkout -b feat/member-dashboard develop
git checkout -b feat/discord-notify develop

git checkout main && git merge develop && git tag v0.4.0 && git push origin main --tags
```
