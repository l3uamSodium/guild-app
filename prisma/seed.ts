import { config } from "dotenv";
config();

import { Role, Status, MemberType, QuestStatus, WarStatus, LeaveStatus, ShopItemType } from "../generated/prisma/client";

let prisma: any;

async function main() {
  console.log("Starting database seeding...");
  const prismaModule = await import("../lib/prisma");
  prisma = prismaModule.prisma;

  // 1. Determine active season monthYear dynamically (e.g. "2026-05")
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const monthYear = `${currentYear}-${String(currentMonthNum).padStart(2, "0")}`;

  console.log(`Targeting current season: ${monthYear}`);

  // 2. Clear old mock data to guarantee idempotency (safe, won't delete user's active logins)
  console.log("Cleaning up old mock data...");
  await prisma.luckyDrawEntry.deleteMany({
    where: { member: { user: { discordId: { startsWith: "mock_" } } } },
  });
  await prisma.redeemLog.deleteMany({
    where: { member: { user: { discordId: { startsWith: "mock_" } } } },
  });
  await prisma.leaveRequest.deleteMany({
    where: { member: { user: { discordId: { startsWith: "mock_" } } } },
  });
  await prisma.questLog.deleteMany({
    where: { member: { user: { discordId: { startsWith: "mock_" } } } },
  });
  await prisma.warLog.deleteMany({
    where: { member: { user: { discordId: { startsWith: "mock_" } } } },
  });
  await prisma.member.deleteMany({
    where: { user: { discordId: { startsWith: "mock_" } } },
  });
  await prisma.user.deleteMany({
    where: { discordId: { startsWith: "mock_" } },
  });

  // Reset shop items to guarantee clean slate
  await prisma.shopItem.deleteMany();

  // 3. Upsert active season
  const activeSeason = await prisma.guildSeason.upsert({
    where: { monthYear },
    update: { isOpen: true },
    create: { monthYear, isOpen: true },
  });

  // 4. Create 8 mock users & members
  console.log("Creating mock members...");
  const mockMembersData = [
    {
      discordId: "mock_user_1",
      name: "Zoro_Solo",
      nickname: "โซโล",
      role: Role.MEMBER,
      memberType: MemberType.WAR,
    },
    {
      discordId: "mock_user_2",
      name: "Nami_Map",
      nickname: "นามิ",
      role: Role.MEMBER,
      memberType: MemberType.NORMAL,
    },
    {
      discordId: "mock_user_3",
      name: "Luffy_Meat",
      nickname: "ลูฟี่",
      role: Role.GUILD_MASTER,
      memberType: MemberType.WAR,
    },
    {
      discordId: "mock_user_4",
      name: "Sanji_Cook",
      nickname: "ซันจิ",
      role: Role.VICE_MASTER,
      memberType: MemberType.WAR,
    },
    {
      discordId: "mock_user_5",
      name: "Usopp_God",
      nickname: "อุซป",
      role: Role.MEMBER,
      memberType: MemberType.NORMAL,
    },
    {
      discordId: "mock_user_6",
      name: "Chopper_Doc",
      nickname: "ช็อปเปอร์",
      role: Role.MEMBER,
      memberType: MemberType.NORMAL,
    },
    {
      discordId: "mock_user_7",
      name: "Robin_Book",
      nickname: "โรบิน",
      role: Role.MEMBER,
      memberType: MemberType.NORMAL,
    },
    {
      discordId: "mock_user_8",
      name: "Franky_Super",
      nickname: "แฟรงกี้",
      role: Role.MEMBER,
      memberType: MemberType.WAR,
    },
  ];

  const seededMembers = [];
  for (const m of mockMembersData) {
    const user = await prisma.user.create({
      data: {
        discordId: m.discordId,
        name: m.name,
        email: `${m.name.toLowerCase()}@onizuka.mock`,
        image: `https://api.dicebear.com/7.x/bottts/svg?seed=${m.name}`,
      },
    });

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        inGameName: m.name,
        nickname: m.nickname,
        role: m.role,
        status: Status.ACTIVE,
        memberType: m.memberType,
      },
    });

    seededMembers.push(member);
  }

  // 5. Seed daily quest logs & war logs for the past 20 days
  console.log("Generating daily quest logs and war logs for the past 20 days...");
  const today = now.getDate();
  const daysToSeed = Math.min(today, 20);

  for (const member of seededMembers) {
    for (let day = 1; day <= daysToSeed; day++) {
      const date = new Date(Date.UTC(currentYear, currentMonthNum - 1, day, 0, 0, 0, 0));

      // A. Seed daily Quest log
      // 80% DONE, 15% ABSENT, 5% LEAVE
      const rand = Math.random();
      let questStatus: QuestStatus = QuestStatus.DONE;
      if (rand < 0.15) {
        questStatus = QuestStatus.ABSENT;
      } else if (rand < 0.20) {
        questStatus = QuestStatus.LEAVE;
      }

      await prisma.questLog.create({
        data: {
          memberId: member.id,
          seasonId: activeSeason.id,
          date,
          status: questStatus,
          createdBy: "system_seed",
        },
      });

      // B. Seed daily War log (Wednesday and Sunday only)
      const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 3 = Wednesday
      if (dayOfWeek === 0 || dayOfWeek === 3) {
        // 90% ATTENDED, 10% MISSED
        const warStatus = Math.random() < 0.9 ? WarStatus.ATTENDED : WarStatus.MISSED;

        await prisma.warLog.create({
          data: {
            memberId: member.id,
            seasonId: activeSeason.id,
            date,
            status: warStatus,
          },
        });
      }
    }
  }

  // 6. Create beautiful Shop Items
  console.log("Creating guild shop items...");
  const shopItems = [
    {
      name: "บัตรทรูมันนี่ 50 บาท",
      description: "บัตรเติมเงินทรูมันนี่มูลค่า 50 บาทสำหรับใช้งานทั่วไป",
      price: 100,
      stock: 5,
      type: ShopItemType.NORMAL,
      imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
    },
    {
      name: "Steam Wallet Code 100 บาท",
      description: "รหัสเติมเงินร้านค้า Steam มูลค่า 100 บาท ใช้ซื้อเกมที่คุณชื่นชอบ",
      price: 180,
      stock: 2,
      type: ShopItemType.NORMAL,
      imageUrl: "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=500&q=80",
    },
    {
      name: "บัตรพักรบพิเศษ (Extra Break Ticket)",
      description: "สิทธิ์ลากิจ/ขอพักรบพิเศษเพิ่ม 1 วันในซีซันปัจจุบัน",
      price: 50,
      stock: 99,
      type: ShopItemType.NORMAL,
      imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&q=80",
    },
    {
      name: "โมเดล Zoro Limited Edition (ลุ้นรางวัล)",
      description: "สลากลุ้นจับฉลากรับโมเดลโซโล ลิมิเต็ด ส่งถึงบ้านฟรี (ประกาศผลสิ้นเดือน)",
      price: 20,
      stock: 1,
      type: ShopItemType.LUCKY_DRAW,
      imageUrl: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=500&q=80",
      drawClosesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      name: "เสื้อยืดกิลด์ ONIZUKA Exclusive",
      description: "เสื้อยืดกิลด์ลายลิมิเต็ดสีดำนีออนสุดพรีเมียม (ของหมดชั่วคราว)",
      price: 300,
      stock: 0,
      type: ShopItemType.NORMAL,
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80",
    },
  ];

  const seededShopItems = [];
  for (const item of shopItems) {
    const shopItem = await prisma.shopItem.create({
      data: item,
    });
    seededShopItems.push(shopItem);
  }

  // 7. Seed mock Leave Requests (some approved, some pending)
  console.log("Generating sample leave requests and order redemptions...");
  const leaveMember = seededMembers[4]; // Usopp
  const leaveDate1 = new Date(Date.UTC(currentYear, currentMonthNum - 1, today, 0, 0, 0, 0));
  
  await prisma.leaveRequest.create({
    data: {
      memberId: leaveMember.id,
      seasonId: activeSeason.id,
      date: leaveDate1,
      reason: "พักผ่อนเนื่องจากเหนื่อยล้าสะสมจากการผจญภัย",
      status: LeaveStatus.PENDING,
    },
  });

  const leaveMember2 = seededMembers[5]; // Chopper
  const leaveDate2 = new Date(Date.UTC(currentYear, currentMonthNum - 1, today - 1, 0, 0, 0, 0));
  await prisma.leaveRequest.create({
    data: {
      memberId: leaveMember2.id,
      seasonId: activeSeason.id,
      date: leaveDate2,
      reason: "ปรุงยารักษาโรคติดต่อในเมืองหลวงกิลด์",
      status: LeaveStatus.APPROVED,
      reviewedBy: seededMembers[2].id, // Luffy GM
      reviewedAt: new Date(),
    },
  });

  // 8. Seed mock Redeem Logs
  const redeemMember = seededMembers[1]; // Nami
  await prisma.redeemLog.create({
    data: {
      memberId: redeemMember.id,
      itemId: seededShopItems[0].id, // บัตรทรูมันนี่
      pointsSpent: seededShopItems[0].price,
      status: "PENDING",
    },
  });

  const redeemMember2 = seededMembers[0]; // Zoro
  await prisma.redeemLog.create({
    data: {
      memberId: redeemMember2.id,
      itemId: seededShopItems[1].id, // Steam Code
      pointsSpent: seededShopItems[1].price,
      status: "DELIVERED",
      deliveredAt: new Date(),
      deliveredBy: seededMembers[2].id, // Luffy GM
    },
  });

  console.log("Database seeded successfully with beautiful cyberpunk mock data!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
