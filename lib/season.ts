import { prisma } from "./prisma";

/**
 * ดึง Season ปัจจุบันที่กำลังเปิดอยู่ (isOpen = true)
 */
export async function getCurrentSeason() {
  return prisma.guildSeason.findFirst({
    where: { isOpen: true },
  });
}
