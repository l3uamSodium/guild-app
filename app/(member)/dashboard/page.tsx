import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/rbac";
import { getCurrentSeason } from "@/lib/season";
import { getMemberPoints } from "@/lib/points";
import { getLeaderboard } from "@/lib/leaderboard";
import MemberNavbar from "@/components/features/MemberNavbar";
import QuestCalendar from "@/components/features/QuestCalendar";

export const metadata = {
  title: "แดชบอร์ดสมาชิก - ONIZUKA",
};

export default async function MemberDashboardPage() {
  // 1. Authentication & Route Guard
  const session = await getSession();
  const memberId = session?.user?.memberId;
  const status = session?.user?.memberStatus;

  if (!session || !memberId || status !== "ACTIVE") {
    redirect("/");
  }

  // 2. Fetch Member Profile Info
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      user: {
        select: {
          image: true,
          discordId: true,
        },
      },
    },
  });

  if (!member) {
    redirect("/");
  }

  // 3. Fetch Active Season
  const currentSeason = await getCurrentSeason();

  // 4. Fetch Dynamic Point Balance (All-time dynamic calculation)
  const points = await getMemberPoints(memberId, currentSeason?.id);

  // 5. Fetch Daily Quest Logs & War Logs in Current Season
  let questLogs: any[] = [];
  let leaveRequests: any[] = [];
  let warLogs: any[] = [];

  if (currentSeason) {
    questLogs = await prisma.questLog.findMany({
      where: {
        memberId,
        seasonId: currentSeason.id,
      },
      orderBy: {
        date: "asc",
      },
    });

    leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        memberId,
        seasonId: currentSeason.id,
      },
      orderBy: {
        date: "asc",
      },
    });

    warLogs = await prisma.warLog.findMany({
      where: {
        memberId,
        seasonId: currentSeason.id,
      },
    });
  }

  // 6. Fetch Recent Redemptions
  const recentRedeems = await prisma.redeemLog.findMany({
    where: { memberId },
    include: {
      item: {
        select: {
          name: true,
          type: true,
        },
      },
    },
    orderBy: {
      redeemedAt: "desc",
    },
    take: 5,
  });

  // 7. Calculate Statistics
  // Quest rate
  const doneQuests = questLogs.filter((q) => q.status === "DONE").length;
  const absentQuests = questLogs.filter((q) => q.status === "ABSENT").length;
  const totalQuests = doneQuests + absentQuests;
  const questSuccessRate =
    totalQuests > 0 ? Math.round((doneQuests / totalQuests) * 100) : 100;

  // War rate
  const attendedWars = warLogs.filter((w) => w.status === "ATTENDED").length;
  const missedWars = warLogs.filter((w) => w.status === "MISSED").length;
  const totalWars = attendedWars + missedWars;
  const warAttendanceRate =
    totalWars > 0 ? Math.round((attendedWars / totalWars) * 100) : 100;

  // Leaves
  const approvedLeaves = leaveRequests.filter((l) => l.status === "APPROVED").length;

  // 8. Fetch Leaderboard Rank
  let rank = "-";
  if (currentSeason) {
    const leaderboard = await getLeaderboard(memberId, currentSeason.id);
    const myRankEntry = leaderboard.find((e) => e.memberId === memberId);
    if (myRankEntry) {
      rank = `#${myRankEntry.rank}`;
    }
  }

  const joinDate = member.createdAt.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#08080F" }}>
      {/* Shared Navigation Navbar */}
      <MemberNavbar
        avatarUrl={member.user?.image}
        inGameName={member.inGameName}
        role={member.role}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-8 relative z-10">
        {/* Background ambient glows */}
        <div
          className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[350px] h-[350px] opacity-[0.03] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(#FF2D78, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 right-1/4 translate-x-1/2 w-[400px] h-[400px] opacity-[0.03] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(#8B5CF6, transparent 70%)" }}
        />

        {/* Welcome Banner Card */}
        <div
          className="relative p-6 sm:p-8 rounded-3xl border overflow-hidden"
          style={{
            background: "rgba(10, 10, 18, 0.4)",
            borderColor: "rgba(255, 45, 120, 0.1)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border"
                  style={{
                    background:
                      member.memberType === "WAR"
                        ? "rgba(239, 68, 68, 0.15)"
                        : "rgba(16, 185, 129, 0.15)",
                    borderColor:
                      member.memberType === "WAR"
                        ? "rgba(239, 68, 68, 0.4)"
                        : "rgba(16, 185, 129, 0.4)",
                    color: member.memberType === "WAR" ? "#F87171" : "#34D399",
                    fontFamily: "var(--font-noto)",
                  }}
                >
                  {member.memberType === "WAR" ? "สายวอร์ (WAR)" : "สมาชิกปกติ (NORMAL)"}
                </span>

                <span className="text-xs text-slate-500 font-mono">
                  เข้าร่วมกิลด์เมื่อ {joinDate}
                </span>
              </div>

              <h1
                className="text-2xl sm:text-3xl font-extrabold text-slate-100"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                ยินดีต้อนรับกลับมา, {member.inGameName}
              </h1>

              <p className="text-sm text-slate-400" style={{ fontFamily: "var(--font-noto)" }}>
                ฉายา/ชื่อเล่น: <span className="text-pink-400 font-bold">{member.nickname}</span> | ตำแหน่งในกิลด์:{" "}
                <span className="text-purple-400 font-bold font-mono">{member.role}</span>
              </p>
            </div>

            {/* Current Rank Badge */}
            <div
              className="px-6 py-4 rounded-2xl border flex flex-col items-center justify-center min-w-[140px]"
              style={{
                background: "rgba(255, 255, 255, 0.01)",
                borderColor: "rgba(255, 255, 255, 0.05)",
              }}
            >
              <span className="text-xs text-slate-500 uppercase tracking-wider">อันดับของฉัน</span>
              <span
                className="text-3xl font-black font-mono mt-1 text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #FFFFFF, #C084FC)",
                }}
              >
                {rank}
              </span>
            </div>
          </div>
        </div>

        {/* Member Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stat 1: Total Points */}
          <div
            className="p-5 rounded-2xl border"
            style={{
              background: "rgba(10, 10, 18, 0.3)",
              borderColor: "rgba(255, 255, 255, 0.04)",
            }}
          >
            <div className="text-xs text-slate-500" style={{ fontFamily: "var(--font-noto)" }}>
              แต้มกิลด์ที่เหลือ
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 mt-2">
              {points.total.toLocaleString()} <span className="text-xs text-slate-500">Pts</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              สะสมทั้งหมด: {points.earned.toLocaleString()} Pts
            </div>
          </div>

          {/* Stat 2: Quest Rate */}
          <div
            className="p-5 rounded-2xl border"
            style={{
              background: "rgba(10, 10, 18, 0.3)",
              borderColor: "rgba(255, 255, 255, 0.04)",
            }}
          >
            <div className="text-xs text-slate-500" style={{ fontFamily: "var(--font-noto)" }}>
              อัตราส่งเควสต์
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-2">
              {questSuccessRate}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1" style={{ fontFamily: "var(--font-noto)" }}>
              ทำเควสต์สำเร็จ {doneQuests} ครั้ง
            </div>
          </div>

          {/* Stat 3: War Attendance */}
          <div
            className="p-5 rounded-2xl border"
            style={{
              background: "rgba(10, 10, 18, 0.3)",
              borderColor: "rgba(255, 255, 255, 0.04)",
            }}
          >
            <div className="text-xs text-slate-500" style={{ fontFamily: "var(--font-noto)" }}>
              การเข้าร่วมกิลด์วอร์
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-purple-400 mt-2">
              {warAttendanceRate}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1" style={{ fontFamily: "var(--font-noto)" }}>
              เข้าร่วม {attendedWars} ครั้ง
            </div>
          </div>

          {/* Stat 4: Approved Leaves */}
          <div
            className="p-5 rounded-2xl border"
            style={{
              background: "rgba(10, 10, 18, 0.3)",
              borderColor: "rgba(255, 255, 255, 0.04)",
            }}
          >
            <div className="text-xs text-slate-500" style={{ fontFamily: "var(--font-noto)" }}>
              การขอพักรบในซีซัน
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-2">
              {approvedLeaves} <span className="text-xs text-slate-500">วัน</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1" style={{ fontFamily: "var(--font-noto)" }}>
              ได้รับการอนุมัติพักกิจกรรม
            </div>
          </div>
        </div>

        {/* GitHub style Daily Quest Calendar */}
        {currentSeason ? (
          <QuestCalendar
            monthYear={currentSeason.monthYear}
            questLogs={questLogs}
            leaveRequests={leaveRequests}
          />
        ) : (
          <div
            className="p-10 text-center rounded-3xl border text-slate-500 text-sm"
            style={{
              background: "rgba(10, 10, 18, 0.4)",
              borderColor: "rgba(255, 255, 255, 0.05)",
              fontFamily: "var(--font-noto)",
            }}
          >
            ไม่มีซีซันกิจกรรมกิลด์ที่กำลังเปิดใช้งานในขณะนี้
          </div>
        )}

        {/* Two Columns for History Logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column A: Recent Leave Logs */}
          <div
            className="p-6 rounded-3xl border flex flex-col"
            style={{
              background: "rgba(10, 10, 18, 0.4)",
              borderColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-sm font-bold text-slate-300"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                ประวัติการขอพักรบกิลด์ ล่าสุด
              </h3>
              <span className="text-xs text-slate-500 font-mono">ยื่นขอพักกิจกรรมกิลด์</span>
            </div>

            <div className="flex-1 space-y-3">
              {leaveRequests.length === 0 ? (
                <div
                  className="py-12 text-center text-slate-500 text-xs"
                  style={{ fontFamily: "var(--font-noto)" }}
                >
                  ไม่มีข้อมูลประวัติการพักกิจกรรมกิลด์ในซีซันนี้
                </div>
              ) : (
                leaveRequests
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((req) => {
                    const formattedDate = new Date(req.date).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                    });

                    let badgeColor = "#64748B";
                    let badgeBg = "rgba(100,116,139,0.1)";
                    let statusLabel = "กำลังตรวจสอบ";

                    if (req.status === "APPROVED") {
                      badgeColor = "#10B981";
                      badgeBg = "rgba(16,185,129,0.1)";
                      statusLabel = "อนุมัติพักรบ";
                    } else if (req.status === "REJECTED") {
                      badgeColor = "#EF4444";
                      badgeBg = "rgba(239,68,68,0.1)";
                      statusLabel = "ปฏิเสธ";
                    }

                    return (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all duration-200 hover:bg-white/[0.01]"
                        style={{
                          background: "rgba(255,255,255,0.01)",
                          borderColor: "rgba(255,255,255,0.03)",
                        }}
                      >
                        <div className="space-y-1">
                          <div className="text-xs text-slate-400 font-semibold">
                            ขอหยุดวันที่ {formattedDate}
                          </div>
                          <div
                            className="text-xs text-slate-500 line-clamp-1"
                            style={{ fontFamily: "var(--font-noto)" }}
                          >
                            เหตุผล: {req.reason}
                          </div>
                        </div>

                        <span
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider"
                          style={{
                            color: badgeColor,
                            background: badgeBg,
                            border: `1px solid ${badgeColor}22`,
                            fontFamily: "var(--font-noto)",
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Column B: Recent Shop Redemptions */}
          <div
            className="p-6 rounded-3xl border flex flex-col"
            style={{
              background: "rgba(10, 10, 18, 0.4)",
              borderColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-sm font-bold text-slate-300"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                ประวัติการแลกของรางวัล ล่าสุด
              </h3>
              <span className="text-xs text-slate-500 font-mono">แลกด้วยแต้มสะสม</span>
            </div>

            <div className="flex-1 space-y-3">
              {recentRedeems.length === 0 ? (
                <div
                  className="py-12 text-center text-slate-500 text-xs"
                  style={{ fontFamily: "var(--font-noto)" }}
                >
                  ไม่มีข้อมูลประวัติการแลกของรางวัลใด ๆ
                </div>
              ) : (
                recentRedeems.map((log) => {
                  const redeemDate = new Date(log.redeemedAt).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                  });

                  let badgeColor = "#E2E8F0";
                  let statusText = "รอจัดส่ง";

                  if (log.status === "DELIVERED") {
                    badgeColor = "#10B981";
                    statusText = "จัดส่งแล้ว";
                  }

                  return (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all duration-200 hover:bg-white/[0.01]"
                      style={{
                        background: "rgba(255,255,255,0.01)",
                        borderColor: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <div className="space-y-1">
                        <div className="text-xs text-slate-300 font-semibold">
                          {log.item.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          แลกเมื่อ {redeemDate} | ใช้ไป {log.pointsSpent.toLocaleString()} Pts
                        </div>
                      </div>

                      <span
                        className="text-[10px] font-bold"
                        style={{ color: badgeColor, fontFamily: "var(--font-noto)" }}
                      >
                        {statusText}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
