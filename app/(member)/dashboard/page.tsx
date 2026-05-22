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
    <div className="min-h-screen flex flex-col" style={{ background: "#08080F" }}>
      {/* Fixed background layers */}
      <div className="page-bg" />
      <div className="page-dot-grid" />

      {/* Navbar */}
      <MemberNavbar
        avatarUrl={member.user?.image}
        inGameName={member.inGameName}
        role={member.role}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-6 relative z-10">

        {/* ── Welcome Banner ─────────────────────────────────── */}
        <div
          className="relative p-6 sm:p-10 rounded-3xl border overflow-hidden premium-glass-panel"
        >
          {/* Pink top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,45,120,0.8) 40%, rgba(192,132,252,0.8) 70%, transparent 100%)",
              boxShadow: "0 0 15px rgba(255, 45, 120, 0.5)",
            }}
          />

          {/* Premium Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase border"
                  style={{
                    background:
                      member.memberType === "WAR"
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(16, 185, 129, 0.1)",
                    borderColor:
                      member.memberType === "WAR"
                        ? "rgba(239, 68, 68, 0.3)"
                        : "rgba(16, 185, 129, 0.3)",
                    color: member.memberType === "WAR" ? "#F87171" : "#34D399",
                    fontFamily: "var(--font-noto)",
                  }}
                >
                  {member.memberType === "WAR" ? "สายวอร์" : "สมาชิกปกติ"}
                </span>

                <span className="text-[11px] text-slate-600 font-mono">
                  เข้าร่วม {joinDate}
                </span>
              </div>

              <h1
                className="text-2xl sm:text-3xl font-extrabold text-slate-100 truncate"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                {member.inGameName}
              </h1>

              <p className="text-sm text-slate-500" style={{ fontFamily: "var(--font-noto)" }}>
                ชื่อเล่น:{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #FF6B9D, #C084FC)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 700,
                  }}
                >
                  {member.nickname}
                </span>
                {" "}·{" "}
                <span className="text-purple-400 font-mono">{member.role}</span>
              </p>
            </div>

            {/* Rank Badge */}
            <div
              className="flex-shrink-0 px-8 py-6 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-300"
              style={{
                background: "linear-gradient(145deg, rgba(30, 30, 45, 0.7), rgba(15, 15, 25, 0.9))",
                borderColor: "rgba(192, 132, 252, 0.3)",
                minWidth: "140px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              {/* Inner animated glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <span className="text-[11px] text-purple-300/70 uppercase tracking-[0.2em] mb-2 font-semibold relative z-10">อันดับ</span>
              <span
                className="text-4xl font-black font-mono relative z-10"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #E8B4F8 50%, #C084FC 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 4px 8px rgba(192, 132, 252, 0.25))",
                }}
              >
                {rank}
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Points */}
          <StatCard
            label="แต้มคงเหลือ"
            value={points.total.toLocaleString()}
            unit="Pts"
            sub={`สะสมทั้งหมด ${points.earned.toLocaleString()} Pts`}
            accentColor="#06B6D4"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
          />

          {/* Quest rate */}
          <StatCard
            label="อัตราส่งเควสต์"
            value={`${questSuccessRate}%`}
            unit=""
            sub={`สำเร็จ ${doneQuests} ครั้ง`}
            accentColor="#10B981"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
          />

          {/* War attendance */}
          <StatCard
            label="เข้าร่วมวอร์"
            value={`${warAttendanceRate}%`}
            unit=""
            sub={`เข้าร่วม ${attendedWars} ครั้ง`}
            accentColor="#8B5CF6"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            }
          />

          {/* Leaves */}
          <StatCard
            label="พักกิจกรรม"
            value={approvedLeaves.toString()}
            unit="วัน"
            sub="ได้รับอนุมัติในซีซัน"
            accentColor="#FACC15"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            }
          />
        </div>

        {/* ── Discord Test ─────────────────────────────────────── */}
        <DiscordTestButton />

        {/* ── Quest Calendar ───────────────────────────────────── */}
        {currentSeason ? (
          <QuestCalendar
            monthYear={currentSeason.monthYear}
            questLogs={questLogs}
            leaveRequests={leaveRequests}
          />
        ) : (
          <div
            className="p-10 text-center rounded-2xl border text-slate-500 text-sm"
            style={{
              background: "rgba(10, 10, 18, 0.4)",
              borderColor: "rgba(255, 255, 255, 0.05)",
              fontFamily: "var(--font-noto)",
            }}
          >
            ไม่มีซีซันกิจกรรมกิลด์ที่กำลังเปิดใช้งานในขณะนี้
          </div>
        )}

        {/* ── History Panels ───────────────────────────────────── */}
        <HistoryPanels
          leaveRequests={serialisedLeaveRequests}
          recentRedeems={serialisedRedeems}
        />
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── */
/*  Sub-components rendered server-side but kept in same file for simplicity   */
/* ──────────────────────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  unit,
  sub,
  accentColor,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  sub: string;
  accentColor: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="stat-card"
      style={{ "--accent" : accentColor } as React.CSSProperties}
    >
      {/* Icon row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500" style={{ fontFamily: "var(--font-noto)" }}>
          {label}
        </span>
        <span style={{ color: accentColor, opacity: 0.7 }}>{icon}</span>
      </div>

      {/* Value */}
      <div className="font-mono font-extrabold text-xl sm:text-2xl" style={{ color: accentColor }}>
        {value}
        {unit && <span className="text-xs font-normal text-slate-500 ml-1">{unit}</span>}
      </div>

      {/* Sub label */}
      <div className="text-[10px] text-slate-600 mt-1 font-mono">{sub}</div>
    </div>
  );
}

/* History panels — client-rendered to support "View All" modal */
import HistoryPanels from "./HistoryPanels";
