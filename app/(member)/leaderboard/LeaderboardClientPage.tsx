"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import MemberNavbar from "@/components/features/MemberNavbar";

interface LeaderboardEntry {
  memberId: string;
  inGameName: string;
  nickname: string;
  avatar: string | null;
  questCount: number;
  warCount: number;
  pointsSpent: number;
  totalPoints: number;
  isCurrentUser: boolean;
  rank: number;
}

interface SeasonData {
  id: string;
  monthYear: string;
  isOpen: boolean;
}

interface LeaderboardClientPageProps {
  seasons: SeasonData[];
  selectedSeasonId: string;
  leaderboard: LeaderboardEntry[];
  currentMemberId: string;
  memberInfo: {
    inGameName: string;
    role: string;
    avatarUrl: string | null;
    points?: number;
    maxPoints?: number;
  };
}

function Avatar({
  url,
  name,
  size = 36,
  borderColor,
}: {
  url: string | null;
  name: string;
  size?: number;
  borderColor?: string;
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold uppercase overflow-hidden flex-shrink-0 border"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.33,
        background: "rgba(255,255,255,0.03)",
        borderColor: borderColor || "rgba(255,255,255,0.08)",
        color: "#8888A8",
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        name.substring(0, 2)
      )}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex items-center justify-center">
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ color: "#FBBF24", filter: "drop-shadow(0 0 6px rgba(251,191,36,0.5))" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex items-center justify-center">
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ color: "#CBD5E1", filter: "drop-shadow(0 0 5px rgba(203,213,225,0.4))" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex items-center justify-center">
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ color: "#B45309", filter: "drop-shadow(0 0 5px rgba(180,83,9,0.4))" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      </div>
    );
  return (
    <span
      className="text-slate-500 text-xs font-mono font-bold"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "2px 8px",
        borderRadius: 8,
      }}
    >
      #{rank}
    </span>
  );
}

function rowClass(rank: number, isSelf: boolean): string {
  if (isSelf && rank > 3) return "rank-self";
  if (rank === 1) return "rank-gold";
  if (rank === 2) return "rank-silver";
  if (rank === 3) return "rank-bronze";
  if (isSelf) return "rank-self";
  return "";
}

export default function LeaderboardClientPage({
  seasons,
  selectedSeasonId,
  leaderboard,
  currentMemberId,
  memberInfo,
}: LeaderboardClientPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSeasonChange = (seasonId: string) => {
    router.push(`${pathname}?season=${seasonId}`);
  };

  const filteredLeaderboard = leaderboard.filter(
    (entry) =>
      entry.inGameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isCurrentUserInTop10 = leaderboard.slice(0, 10).some((e) => e.isCurrentUser);
  const currentUserEntry = leaderboard.find((e) => e.isCurrentUser);
  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0A14" }}>
      <div className="page-bg" />
      <div className="page-dot-grid" />

      <MemberNavbar
        avatarUrl={memberInfo.avatarUrl}
        inGameName={memberInfo.inGameName}
        role={memberInfo.role}
        points={memberInfo.points}
        maxPoints={memberInfo.maxPoints}
      />

      <main className="flex-1 relative max-w-7xl w-full mx-auto px-4 pt-28 pb-8 md:px-8">
        {/* Top glow accent */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[2px]"
          style={{ 
            background: "linear-gradient(90deg, transparent 0%, rgba(192,132,252,0.6) 40%, rgba(6,182,212,0.6) 60%, transparent 100%)",
            boxShadow: "0 0 20px rgba(192,132,252,0.4)"
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">

          {/* ── Header ──────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 animate-fade-in" style={{ animationDelay: '0ms' }}>
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: "clamp(24px, 5vw, 36px)",
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  background: "linear-gradient(135deg, #FFFFFF 20%, #E879F9 80%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textTransform: "uppercase",
                  filter: "drop-shadow(0 2px 8px rgba(192,132,252,0.3))"
                }}
              >
                GUILD LEADERBOARD
              </h1>
              <p style={{ fontFamily: "var(--font-noto)", color: "#94A3B8", fontSize: "14px", marginTop: "4px" }}>
                ตารางคะแนนสะสมและอันดับของสมาชิกกิลด์ ONIZUKA
              </p>
            </div>

            {selectedSeason && (
              <div
                className="px-6 py-3.5 rounded-2xl border flex-shrink-0"
                style={{
                  background: "linear-gradient(145deg, rgba(20,15,30,0.5) 0%, rgba(10,5,15,0.7) 100%)",
                  borderColor: "rgba(192,132,252,0.2)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                <div style={{ color: "#94A3B8", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "bold" }}>
                  ซีซันที่เลือก
                </div>
                <div
                  className="text-sm font-bold text-white mt-1 flex items-center gap-2"
                  style={{ fontFamily: "var(--font-noto)" }}
                >
                  {selectedSeason.monthYear}
                  {selectedSeason.isOpen && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border"
                      style={{
                        color: "#6EE7B7",
                        background: "rgba(16,185,129,0.15)",
                        borderColor: "rgba(16,185,129,0.3)",
                      }}
                    >
                      กำลังเปิด
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Filter Controls ──────────────────────────────── */}
          <div
            className="p-6 rounded-3xl border backdrop-blur-md flex flex-col md:flex-row md:items-center gap-5 animate-fade-in transition-all duration-500 hover:shadow-[0_8px_32px_rgba(192,132,252,0.1)]"
            style={{
              background: "linear-gradient(145deg, rgba(20,15,30,0.6) 0%, rgba(10,5,15,0.8) 100%)",
              borderColor: "rgba(192, 132, 252, 0.2)",
              animationDelay: '100ms'
            }}
          >
            {/* Season selector */}
            <div className="flex flex-col gap-2 w-full md:w-2/5">
              <label style={{ fontFamily: "var(--font-noto)", color: "#94A3B8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "bold" }}>
                เลือกซีซัน
              </label>
              <select
                value={selectedSeasonId}
                onChange={(e) => handleSeasonChange(e.target.value)}
                className="input-dark cursor-pointer text-sm py-2.5"
                style={{ 
                  fontFamily: "var(--font-noto)",
                  background: "rgba(0,0,0,0.4)",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                {seasons.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0A0A14]">
                    {s.monthYear} {s.isOpen ? "(เปิดอยู่)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-2 flex-1">
              <label style={{ fontFamily: "var(--font-noto)", color: "#94A3B8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "bold" }}>
                ค้นหาสมาชิก
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาตามชื่อในเกมหรือชื่อเล่น..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-dark w-full pl-10 pr-4 text-sm py-2.5 transition-colors focus:border-cyan-500/50"
                  style={{ 
                    fontFamily: "var(--font-noto)",
                    background: "rgba(0,0,0,0.4)",
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                />
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* ── Table ────────────────────────────────────────── */}
          <div
            className="rounded-3xl border overflow-hidden backdrop-blur-md animate-fade-in relative transition-all duration-500 hover:shadow-[0_8px_32px_rgba(6,182,212,0.1)]"
            style={{
              background: "linear-gradient(145deg, rgba(20,15,30,0.6) 0%, rgba(10,5,15,0.8) 100%)",
              borderColor: "rgba(6, 182, 212, 0.2)",
              animationDelay: '200ms'
            }}
          >
            {/* Table top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.5), rgba(192,132,252,0.5), transparent)",
              }}
            />

            {filteredLeaderboard.length === 0 ? (
              <div
                className="p-16 text-center text-slate-400"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                ไม่พบรายชื่อในซีซันนี้หรือการค้นหานี้
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      className="border-b"
                      style={{
                        borderColor: "rgba(255,255,255,0.05)",
                        background: "rgba(0,0,0,0.2)",
                      }}
                    >
                      <th className="p-5 pl-7 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-center w-24">
                        อันดับ
                      </th>
                      <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                        สมาชิก
                      </th>
                      <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-center w-32 hidden sm:table-cell">
                        เควสต์
                      </th>
                      <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-center w-32 hidden sm:table-cell">
                        วอร์
                      </th>
                      <th className="p-5 pr-7 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-right w-40">
                        คะแนนสะสม
                      </th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {filteredLeaderboard.map((entry, index) => {
                      const isSelf = entry.isCurrentUser;
                      const isTop3 = entry.rank <= 3;

                      let nameColor = "#94A3B8"; // slate-400
                      if (entry.rank === 1) nameColor = "#FBBF24";
                      else if (entry.rank === 2) nameColor = "#E2E8F0"; // brighter silver
                      else if (entry.rank === 3) nameColor = "#F59E0B"; // brighter bronze
                      else if (isSelf) nameColor = "#22D3EE"; // cyan-400

                      let avatarBorder = "rgba(255,255,255,0.05)";
                      if (entry.rank === 1) avatarBorder = "rgba(251,191,36,0.6)";
                      else if (entry.rank === 2) avatarBorder = "rgba(226,232,240,0.5)";
                      else if (entry.rank === 3) avatarBorder = "rgba(245,158,11,0.5)";
                      else if (isSelf) avatarBorder = "rgba(34,211,238,0.5)";

                      let rowOpacity = 1;
                      if (!isTop3 && !isSelf) {
                        rowOpacity = Math.max(0.35, 1 - (entry.rank - 3) * 0.08);
                      }

                      return (
                        <tr
                          key={entry.memberId}
                          className={`transition-all duration-300 hover:bg-white/[0.04] hover:opacity-100 group animate-row-fade-in ${rowClass(entry.rank, isSelf)}`}
                          style={{ 
                            animationDelay: `${Math.min(index * 40, 400)}ms`, 
                            animationFillMode: "both",
                            opacity: rowOpacity
                          }}
                        >
                          {/* Rank */}
                          <td className="p-4 pl-7 text-center">
                            <RankBadge rank={entry.rank} />
                          </td>

                          {/* Member */}
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <Avatar
                                  url={entry.avatar}
                                  name={entry.inGameName}
                                  size={isTop3 ? 44 : 38}
                                  borderColor={avatarBorder}
                                />
                                {isSelf && (
                                  <span
                                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 animate-neon-pulse"
                                    style={{
                                      background: "#22D3EE",
                                      borderColor: "#0A0A14",
                                      boxShadow: "0 0 10px rgba(34,211,238,0.5)"
                                    }}
                                  />
                                )}
                              </div>
                              <div>
                                <div
                                  className={`font-bold transition-colors group-hover:text-white ${isTop3 ? "text-lg" : "text-sm"}`}
                                  style={{ fontFamily: "var(--font-noto)", color: nameColor }}
                                >
                                  {entry.inGameName}
                                </div>
                                <div
                                  className="text-[12px] text-slate-500 font-medium"
                                  style={{ fontFamily: "var(--font-noto)" }}
                                >
                                  {entry.nickname}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Quests */}
                          <td className="p-4 text-center hidden sm:table-cell">
                            <div className="flex justify-center items-center gap-1.5">
                              <span
                                className="text-sm font-mono font-bold"
                                style={{ color: entry.questCount > 0 ? "#10B981" : "#475569" }}
                              >
                                {entry.questCount}
                              </span>
                            </div>
                          </td>

                          {/* Wars */}
                          <td className="p-4 text-center hidden sm:table-cell">
                            <div className="flex justify-center items-center gap-1.5">
                              <span
                                className="text-sm font-mono font-bold"
                                style={{ color: entry.warCount > 0 ? "#A855F7" : "#475569" }}
                              >
                                {entry.warCount}
                              </span>
                            </div>
                          </td>

                          {/* Points */}
                          <td className="p-4 pr-7 text-right">
                            <span
                              className={`font-mono font-extrabold ${isTop3 ? "text-xl tracking-tight" : "text-base"}`}
                              style={{
                                color: isSelf ? "#22D3EE" : isTop3 ? nameColor : "#E2E8F0",
                                textShadow: isSelf ? "0 0 12px rgba(34,211,238,0.5)" : isTop3 ? `0 0 16px ${nameColor}60` : "none",
                              }}
                            >
                              {entry.totalPoints.toLocaleString()}
                              <span className="text-[11px] font-medium text-slate-500 ml-1.5 uppercase tracking-wider">Pts</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Sticky self card (when out of top 10) ──────────── */}
          {!isCurrentUserInTop10 && currentUserEntry && (
             <div
             className="sticky bottom-8 p-5 rounded-3xl border backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 animate-fade-in"
             style={{
               background: "linear-gradient(145deg, rgba(8, 8, 16, 0.95) 0%, rgba(15, 20, 30, 0.95) 100%)",
               borderColor: "rgba(34,211,238,0.4)",
               boxShadow: "0 0 32px rgba(34,211,238,0.15), 0 16px 40px rgba(0,0,0,0.8)",
               animationDelay: '400ms'
             }}
           >
              <div className="flex items-center gap-5">
                <div
                  className="px-4 py-2 rounded-xl font-mono text-sm font-black border shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  style={{
                    background: "rgba(34,211,238,0.1)",
                    borderColor: "rgba(34,211,238,0.3)",
                    color: "#22D3EE",
                  }}
                >
                  #{currentUserEntry.rank}
                </div>
                <div className="flex items-center gap-4">
                  <Avatar
                    url={currentUserEntry.avatar}
                    name={currentUserEntry.inGameName}
                    size={46}
                    borderColor="rgba(34,211,238,0.5)"
                  />
                  <div>
                    <div
                      className="font-extrabold text-base tracking-wide"
                      style={{ fontFamily: "var(--font-noto)", color: "#22D3EE" }}
                    >
                      {currentUserEntry.inGameName}
                    </div>
                    <div
                      className="text-xs text-slate-400 mt-0.5"
                      style={{ fontFamily: "var(--font-noto)" }}
                    >
                      เควสต์ <span className="text-emerald-400 font-mono font-bold">{currentUserEntry.questCount}</span> · วอร์ <span className="text-purple-400 font-mono font-bold">{currentUserEntry.warCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div style={{ fontFamily: "var(--font-noto)", color: "#94A3B8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "bold" }}>
                  คะแนนสะสมของคุณ
                </div>
                <div
                  className="text-2xl font-mono font-black mt-0.5"
                  style={{ color: "#22D3EE", textShadow: "0 0 20px rgba(34,211,238,0.5)" }}
                >
                  {currentUserEntry.totalPoints.toLocaleString()} <span className="text-sm font-medium text-slate-400 uppercase tracking-wider ml-1">Pts</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
