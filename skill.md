# ONIZUKA Guild App Developer Cheat Sheet & Skills

ยินดีต้อนรับสู่คู่มือพัฒนาและทักษะเทคโนโลยีที่ใช้ในระบบจัดการกิลด์ **ONIZUKA** 👹

---

## 🛠️ Core Technology Stack

1. **Frontend / Core:** Next.js 16.2.6 (App Router) + React 19.2.4
2. **Styling:** Tailwind CSS v4.0 (Custom dark glassmorphism theme)
3. **Database:** PostgreSQL (Hosted on Neon Cloud) + Prisma 7.8.0 ORM
4. **Authentication:** NextAuth.js v4.24.14 (JWT Session Strategy with PrismaAdapter)

---

## 🔑 Key Conventions & Architecture

### 1. ระบบรักษาความปลอดภัยและตรวจสอบยศ (RBAC & Route Protection)
เราไม่ได้ใช้ `middleware.ts` แบบปกติ แต่เราใช้ไฟล์ **`proxy.ts`** (ทำงานที่ Edge Runtime) เพื่อดักกรองเส้นทางเดินของ URL ทั้งหมดแบบ Real-time:
* **Public Routes:** `/`, `/api/auth` (เข้าได้ทุกคน)
* **Onboarding Route (`/onboarding`):** เข้าได้เฉพาะผู้ที่ล็อกอิน Discord แล้ว แต่ยังไม่มีรายชื่อในตาราง `Member`
* **Pending Route (`/pending`):** เข้าได้เฉพาะสมาชิกที่กรอกฟอร์มแล้ว แต่สถานะเป็น `PENDING` (รอการอนุมัติ)
* **Admin Routes (`/admin/*` และ `/members`):** ป้องกันระดับสูงด้วยตัวช่วยจาก `lib/rbac.ts` อนุญาตเฉพาะยศ `GUILD_MASTER` หรือ `VICE_MASTER` เท่านั้น

### 2. ฟังก์ชันตรวจสอบสิทธิ์ใน Code (`lib/rbac.ts`)
ใช้ฟังก์ชันเหล่านี้ใน **Server Components** หรือ **Server Actions** เพื่อตรวจสอบสิทธิ์:
```typescript
import { requireRole, isAdmin } from "@/lib/rbac";

// ป้องกัน Server Action (จะ throw error ทันทีถ้าไม่ใช่แอดมิน)
await requireRole(["GUILD_MASTER", "VICE_MASTER"]);
```

### 3. โครงสร้าง Database ที่ไร้รอยต่อ
ประวัติการทำเควส (`QuestLog`) และประวัติการลงวอร์ (`WarLog`) ทั้งหมดจะเชื่อมต่อด้วย **`memberId` (UUID)** เสมอ! 
> 💡 **Skill Tip:** หากผู้เล่นเปลี่ยนชื่อในเกม (IGN), ชื่อเล่น หรือชื่อดิสคอร์ด ประวัติทั้งหมดจะไม่หายและจะวิ่งตามชื่อใหม่ไปอัตโนมัติ เพราะ ID ผูกอยู่กับระบบหลังบ้าน ไม่ใช่ตัวหนังสือ

---

## 💻 Terminal Commands Quick Reference

### 1. การเปิดใช้งานเซิร์ฟเวอร์พัฒนา (Local Development)
```bash
npm run dev
```

### 2. การจัดการฐานข้อมูล (Prisma ORM)
* **เปิดหน้าจอจัดการ DB หลังบ้าน (Prisma Studio):**
  ```bash
  npx prisma studio
  ```
* **อัปเดต Schema และสร้าง Client ใหม่:**
  ```bash
  npx prisma generate
  ```
* **รันคำสั่ง Migration เพื่อซิงค์ DB ขึ้น Cloud:**
  ```bash
  npx prisma migrate deploy
  ```

### 3. Git Workflow ประจำโปรเจกต์
* **สร้างกิ่งฟีเจอร์ใหม่:**
  ```bash
  git checkout -b feat/your-feature-name develop
  ```
* **บันทึกงานและ Commit:**
  ```bash
  git add .
  git commit -m "feat(scope): descriptive message"
  ```
* **รวมงานขึ้นระบบหลัก:**
  ```bash
  git checkout develop
  git merge feat/your-feature-name
  ```

---

## 🌟 Premium CSS/Tailwind Guidelines
เพื่อความสม่ำเสมอของหน้าต่าง UI ของกิลด์ ONIZUKA ให้รักษา Theme สีและ Glassmorphism ไว้เสมอ:
* **Background:** `#08080F` (ดำสนิทโทนน้ำเงินลึก)
* **Primary Accent:** `#FF2D78` (ชมพูโอนิซึกะ)
* **Secondary Accent:** `#FF6B9D` (ชมพูหวานเรืองแสง)
* **Glassmorphic Cards:**
  ```css
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 45, 120, 0.15);
  backdrop-filter: blur(24px);
  box-shadow: 0 0 100px rgba(255, 45, 120, 0.06), 0 0 40px rgba(0, 0, 0, 0.5);
  ```
