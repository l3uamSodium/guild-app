import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/rbac";
import { getCurrentSeason } from "@/lib/season";
import { getMemberPoints } from "@/lib/points";
import { getLeaderboard } from "@/lib/leaderboard";
import MemberNavbar from "@/components/features/MemberNavbar";
import QuestCalendar from "@/components/features/QuestCalendar";
import DiscordTestButton from "@/components/features/DiscordTestButton";

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

  // 4. Fetch Dynamic Point Balance
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

  // 6. Fetch ALL Redemptions (not just 5)
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
    take: 20,
  });

  // 7. Calculate Statistics
  const doneQuests = questLogs.filter((q) => q.status === "DONE").length;
  const absentQuests = questLogs.filter((q) => q.status === "ABSENT").length;
  const totalQuests = doneQuests + absentQuests;
  const questSuccessRate =
    totalQuests > 0 ? Math.round((doneQuests / totalQuests) * 100) : 100;

  const attendedWars = warLogs.filter((w) => w.status === "ATTENDED").length;
  const missedWars = warLogs.filter((w) => w.status === "MISSED").length;
  const totalWars = attendedWars + missedWars;
  const warAttendanceRate =
    totalWars > 0 ? Math.round((attendedWars / totalWars) * 100) : 100;

  const approvedLeaves = leaveRequests.filter((l) => l.status === "APPROVED").length;

  // 8. Fetch Leaderboard Rank
  let rank = "-";
  let numericRank = 0;
  if (currentSeason) {
    const leaderboard = await getLeaderboard(memberId, currentSeason.id);
    const myRankEntry = leaderboard.find((e) => e.memberId === memberId);
    if (myRankEntry) {
      numericRank = myRankEntry.rank;
      rank = `#${numericRank}`;
    }
  }

  let rankConfig = {
    bg: "rgba(255,255,255,0.02)",
    border: "rgba(192,132,252,0.2)",
    shadow: "0 4px 20px rgba(0,0,0,0.3)",
    gradient: "from-purple-500/10 to-pink-500/10",
    textGradient: "linear-gradient(135deg, #FFFFFF 20%, #E879F9 80%)",
    textShadow: "drop-shadow(0 2px 8px rgba(192,132,252,0.3))",
    labelColor: "text-purple-300/80",
    icon: null as React.ReactNode | null,
    animateClass: ""
  };

  if (numericRank === 1) {
    rankConfig = {
      bg: "rgba(250, 204, 21, 0.05)",
      border: "rgba(250, 204, 21, 0.6)",
      shadow: "0 0 40px rgba(250, 204, 21, 0.3)",
      gradient: "from-yellow-400/30 to-amber-600/30",
      textGradient: "linear-gradient(135deg, #FEF08A 20%, #F59E0B 80%)",
      textShadow: "drop-shadow(0 4px 16px rgba(250, 204, 21, 0.7))",
      labelColor: "text-yellow-400/90",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-yellow-400 drop-shadow-md">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l4 3 5-6 5 6 4-3v10H3V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18" />
        </svg>
      ),
      animateClass: "animate-neon-pulse"
    };
  } else if (numericRank === 2) {
    rankConfig = {
      bg: "rgba(148, 163, 184, 0.05)",
      border: "rgba(148, 163, 184, 0.4)",
      shadow: "0 0 24px rgba(148, 163, 184, 0.2)",
      gradient: "from-slate-300/20 to-slate-500/20",
      textGradient: "linear-gradient(135deg, #F8FAFC 20%, #94A3B8 80%)",
      textShadow: "drop-shadow(0 2px 10px rgba(148, 163, 184, 0.5))",
      labelColor: "text-slate-300/90",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-slate-300 drop-shadow-md">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4M7 4h10M5 4a2 2 0 00-2 2v2a6 6 0 006 6h6a6 6 0 006-6V6a2 2 0 00-2-2" />
        </svg>
      ),
      animateClass: ""
    };
  } else if (numericRank === 3) {
    rankConfig = {
      bg: "rgba(180, 83, 9, 0.05)",
      border: "rgba(180, 83, 9, 0.4)",
      shadow: "0 0 24px rgba(180, 83, 9, 0.2)",
      gradient: "from-orange-400/20 to-amber-700/20",
      textGradient: "linear-gradient(135deg, #FDBA74 20%, #B45309 80%)",
      textShadow: "drop-shadow(0 2px 10px rgba(180, 83, 9, 0.5))",
      labelColor: "text-orange-300/90",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-orange-400 drop-shadow-md">
          <circle cx="12" cy="14" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 10.5V3l-3 2-2-1 1 6.5M14 10.5V3l3 2 2-1-1 6.5" />
        </svg>
      ),
      animateClass: ""
    };
  }

  const joinDate = member.createdAt.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Serialise for client boundary
  const serialisedLeaveRequests = leaveRequests.map((l) => ({
    id: l.id,
    date: l.date.toISOString ? l.date.toISOString() : String(l.date),
    reason: l.reason,
    status: l.status,
    createdAt: l.createdAt?.toISOString ? l.createdAt.toISOString() : "",
  }));

  const serialisedRedeems = recentRedeems.map((r) => ({
    id: r.id,
    itemName: r.item.name,
    pointsSpent: r.pointsSpent,
    status: r.status,
    redeemedAt: r.redeemedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0A14" }}>
      {/* Fixed background layers */}
      <div className="page-bg" />
      <div className="page-dot-grid" />

      {/* Navbar */}
      <MemberNavbar
        avatarUrl={member.user?.image}
        inGameName={member.inGameName}
        role={member.role}
        points={points.total}
        maxPoints={points.earned < 50000 ? 50000 : points.earned}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pt-28 pb-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 auto-rows-auto gap-6">

          {/* ── Welcome Banner (Spans full width) ──────────────── */}
          <div className="lg:col-span-12 animate-fade-scale-in" style={{ animationDelay: '0ms' }}>
            <div
              className="relative p-6 sm:p-8 rounded-3xl border overflow-hidden transition-all duration-500 hover:shadow-[0_8px_32px_rgba(192,132,252,0.15)]"
              style={{
                background: "linear-gradient(145deg, rgba(20,15,30,0.7) 0%, rgba(10,5,15,0.9) 100%)",
                borderColor: "rgba(192, 132, 252, 0.25)",
                backdropFilter: "blur(32px)",
              }}
            >
              {/* Purple top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(192,132,252,0.8) 40%, rgba(6,182,212,0.6) 70%, transparent 100%)",
                  boxShadow: "0 0 20px rgba(192,132,252,0.4)"
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 items-center">
                {/* ── Left: Profile Info ── */}
                <div className="space-y-4 min-w-0 md:col-span-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase border"
                      style={{
                        background:
                          member.memberType === "WAR"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(16, 185, 129, 0.15)",
                        borderColor:
                          member.memberType === "WAR"
                            ? "rgba(239, 68, 68, 0.4)"
                            : "rgba(16, 185, 129, 0.4)",
                        color: member.memberType === "WAR" ? "#FCA5A5" : "#6EE7B7",
                        fontFamily: "var(--font-noto)",
                      }}
                    >
                      {member.memberType === "WAR" ? "สายวอร์" : "สมาชิกปกติ"}
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono">
                      เข้าร่วม {joinDate}
                    </span>
                  </div>

                  <h1
                    className="text-3xl sm:text-4xl font-extrabold text-white truncate drop-shadow-md tracking-tight"
                    style={{ fontFamily: "var(--font-noto)" }}
                  >
                    {member.inGameName}
                  </h1>

                  <div className="flex flex-col gap-1 text-sm text-slate-400" style={{ fontFamily: "var(--font-noto)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">ชื่อเล่น</span>
                      <span
                        style={{
                          background: "linear-gradient(90deg, #FF9EBB, #D8B4FE)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontWeight: 700,
                        }}
                      >
                        {member.nickname}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">ตำแหน่ง</span>
                      <span className="text-cyan-300 font-mono font-bold tracking-wide">{member.role}</span>
                    </div>
                  </div>
                </div>

                {/* ── Middle: Progress Stats ── */}
                <div className="flex flex-col justify-center space-y-5 md:col-span-1 border-y md:border-y-0 md:border-x border-white/5 py-6 md:py-2 md:px-8">
                  {/* Quest Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium" style={{ fontFamily: "var(--font-noto)" }}>ความสำเร็จเควสต์</span>
                      <span className="text-emerald-400 font-mono font-bold">{questSuccessRate}%</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-1.5 border border-white/5">
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-1.5 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000" style={{ width: `${questSuccessRate}%` }} />
                    </div>
                  </div>

                  {/* War Progress (if applicable) */}
                  {member.memberType === "WAR" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium" style={{ fontFamily: "var(--font-noto)" }}>การเข้าร่วมวอร์</span>
                        <span className="text-purple-400 font-mono font-bold">{warAttendanceRate}%</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-1.5 border border-white/5">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-300 h-1.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000" style={{ width: `${warAttendanceRate}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Leave Days */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 font-medium" style={{ fontFamily: "var(--font-noto)" }}>ใช้วันพักกิจกรรมไปแล้ว</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400 font-mono font-bold text-sm">{approvedLeaves}</span>
                      <span className="text-slate-500 font-mono">วัน</span>
                    </div>
                  </div>
                </div>

                {/* ── Right: Rank Badge ── */}
                <div className="flex justify-center md:justify-end md:col-span-1">
                  <div
                    className={`flex-shrink-0 px-8 py-6 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden group ${rankConfig.animateClass} w-full sm:w-auto`}
                    style={{
                      background: rankConfig.bg,
                      borderColor: rankConfig.border,
                      minWidth: "160px",
                      boxShadow: rankConfig.shadow,
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${rankConfig.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {rankConfig.icon && (
                      <div className="absolute top-3 right-3 z-10 animate-bounce" style={{ animationDuration: '2s' }}>
                        {rankConfig.icon}
                      </div>
                    )}

                    <span className={`text-[10px] ${rankConfig.labelColor} uppercase tracking-widest mb-1.5 relative z-10 font-bold`}>อันดับปัจจุบัน</span>
                    <span
                      className="text-5xl font-black font-mono relative z-10 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: rankConfig.textGradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        filter: rankConfig.textShadow
                      }}
                    >
                      {rank}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Quest Calendar (Left Column, Spans 8) ──────────── */}
          <div className="lg:col-span-8 h-full animate-fade-scale-in" style={{ animationDelay: '100ms' }}>
            {currentSeason ? (
              <QuestCalendar
                monthYear={currentSeason.monthYear}
                questLogs={questLogs}
                leaveRequests={leaveRequests}
              />
            ) : (
              <div
                className="p-10 text-center rounded-3xl border text-slate-500 text-sm h-full flex items-center justify-center"
                style={{
                  background: "rgba(10, 10, 18, 0.4)",
                  borderColor: "rgba(255, 255, 255, 0.05)",
                  fontFamily: "var(--font-noto)",
                }}
              >
                ไม่มีซีซันกิจกรรมกิลด์ที่กำลังเปิดใช้งานในขณะนี้
              </div>
            )}
          </div>

          {/* ── Right Column Sidebar (History, Spans 4) ────────── */}
          <div className="lg:col-span-4 flex flex-col gap-6 animate-fade-scale-in" style={{ animationDelay: '200ms' }}>
            {/* ── History Panels ───────────────────────────────────── */}
            <HistoryPanels
              leaveRequests={serialisedLeaveRequests}
              recentRedeems={serialisedRedeems}
            />
          </div>

        </div>
      </main>
    </div>
  );
}

import HistoryPanels from "./HistoryPanels";
