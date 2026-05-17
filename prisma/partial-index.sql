-- Migration: Add Partial Unique Index for GuildSeason
-- รัน AFTER จาก `npx prisma migrate dev --name init`
--
-- ป้องกันการเปิด Season มากกว่า 1 season พร้อมกัน
-- Standard @@unique ทำไม่ได้เพราะ isOpen = false มีได้หลายแถว

CREATE UNIQUE INDEX only_one_open_season
  ON "GuildSeason" ("isOpen")
  WHERE "isOpen" = true;
