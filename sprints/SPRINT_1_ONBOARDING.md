# Sprint 1 — Onboarding & Landing

> เป้าหมาย: สมาชิกใหม่ login แล้ว onboard ได้ครบ, Admin approve ได้, Landing page พร้อม

## Tasks & Branches

### `feat/onboarding-form` [IN PROGRESS]
**Files:** `app/(public)/onboarding/page.tsx` (Basic info page created), `app/(public)/onboarding/actions.ts`

**Prompt:**
```
สร้าง onboarding form ใน app/(auth)/onboarding/page.tsx
- fields: inGameName (required), nickname (required)
- validate ด้วย zod + react-hook-form
- server action createMember() ใน actions.ts:
  * เช็คว่ามี Member ของ userId นี้แล้วหรือยัง
  * ถ้ามีแล้ว redirect /pending หรือ /dashboard ตาม status
  * สร้าง Member ใหม่ status=PENDING
  * ส่ง Discord webhook แจ้ง admin
  * redirect /pending
ใช้ Shadcn UI Form, Tailwind CSS
```

---

### `feat/pending-page`
**Files:** `app/(auth)/pending/page.tsx`

**Prompt:**
```
สร้าง pending approval page ใน app/(auth)/pending/page.tsx
แสดง:
- Discord tag ของ user ที่ login อยู่
- ข้อความ "รอ Admin review ภายใน 24 ชั่วโมง"
- ปุ่ม "แจ้ง Admin ใน Discord" → เปิด Discord link
- ถ้า status เปลี่ยนเป็น ACTIVE แล้ว → redirect /dashboard อัตโนมัติ (polling หรือ server-side check)
ไม่ให้ user กด Submit onboarding ซ้ำได้
```

---

### `feat/admin-approve`
**Files:** `app/(admin)/members/page.tsx`, `app/(admin)/members/actions.ts`

**Prompt:**
```
สร้าง Admin Members page ใน app/(admin)/members/page.tsx
- ตาราง 2 แท็บ: "PENDING" และ "ACTIVE"
- PENDING tab: แสดง inGameName, nickname, Discord, วันที่สมัคร
  + ปุ่ม "Approve" → approveMember() → set status=ACTIVE
- ACTIVE tab: ตาราง + ปุ่ม "Deactivate" → set status=INACTIVE
- server actions ใน actions.ts ต้องบันทึก AuditLog ทุกครั้ง
- เมื่อ approve → ส่ง Discord DM หา member
ใช้ Shadcn UI Table, Tabs, Tailwind CSS
```

---

### `feat/landing-page` [COMPLETED]
**Files:** `app/page.tsx`

**Prompt:**
```
สร้าง Landing page สำหรับ Guild ใน app/(public)/page.tsx
Theme: Dark cyberpunk/gaming aesthetic
- Oni Girl hero banner (placeholder image area สำหรับใส่รูปจริง)
- Guild name ขนาดใหญ่ด้วย font ที่ดูมีพลัง
- ปุ่ม "เข้าร่วม Guild" → กด Login Discord
- section แนะนำ guild สั้นๆ
ใช้ Tailwind CSS, ไม่ต้องใช้ library animation ภายนอก
bg สี #0F0F14, accent #C084FC และ #F472B6
```

---

## Git Commands (Sprint 1)

```bash
git checkout -b feat/onboarding-form develop && git push origin feat/onboarding-form
git checkout -b feat/pending-page develop && git push origin feat/pending-page
git checkout -b feat/admin-approve develop && git push origin feat/admin-approve
git checkout -b feat/landing-page develop && git push origin feat/landing-page

# จบ Sprint 1
git checkout main && git merge develop && git tag v0.1.0 && git push origin main --tags
```
