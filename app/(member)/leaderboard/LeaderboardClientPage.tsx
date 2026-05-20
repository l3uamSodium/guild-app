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
    <div className="min-h-screen flex flex-col" style={{ background: "#08080F" }}>
      <div className="page-bg" />
      <div className="page-dot-grid" />

      <MemberNavbar
        avatarUrl={memberInfo.avatarUrl}
        inGameName={memberInfo.inGameName}
        role={memberInfo.role}
      />

      <main className="flex-1 relative px-4 py-8 md:px-8">
        {/* Top glow accent */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,45,120,0.5), transparent)" }}
        />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">

          {/* ── Header ──────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: "clamp(20px, 4vw, 28px)",
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  background: "linear-gradient(135deg, #FFFFFF 20%, #FF6B9D 80%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textTransform: "uppercase",
                }}
              >
                GUILD LEADERBOARD
              </h1>
              <p style={{ fontFamily: "var(--font-noto)", color: "#5B5B7A", fontSize: "13px", marginTop: "4px" }}>
                ตารางคะแนนสะสมและอันดับของสมาชิกกิลด์ ONIZUKA
              </p>
            </div>

            {selectedSeason && (
              <div
                className="px-5 py-3 rounded-xl border flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ color: "#4B4B6A", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  ซีซันที่เลือก
                </div>
                <div
                  className="text-sm font-bold text-slate-200 mt-0.5"
                  style={{ fontFamily: "var(--font-noto)" }}
                >
                  {selectedSeason.monthYear}
                  {selectedSeason.isOpen && (
                    <span
                      className="ml-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border"
                      style={{
                        color: "#10B981",
                        background: "rgba(16,185,129,0.08)",
                        borderColor: "rgba(16,185,129,0.2)",
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
            className="p-5 rounded-2xl border backdrop-blur-md flex flex-col md:flex-row md:items-center gap-4"
            style={{
              background: "rgba(10, 10, 20, 0.55)",
              borderColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Season selector */}
            <div className="flex flex-col gap-1.5 w-full md:w-2/5">
              <label style={{ fontFamily: "var(--font-noto)", color: "#4B4B6A", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                เลือกซีซัน
              </label>
              <select
                value={selectedSeasonId}
                onChange={(e) => handleSeasonChange(e.target.value)}
                className="input-dark cursor-pointer"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                {seasons.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0A0A12]">
                    {s.monthYear} {s.isOpen ? "(เปิดอยู่)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1.5 flex-1">
              <label style={{ fontFamily: "var(--font-noto)", color: "#4B4B6A", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                ค้นหาสมาชิก
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาตามชื่อในเกมหรือชื่อเล่น..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-dark w-full pl-9 pr-4"
                  style={{ fontFamily: "var(--font-noto)" }}
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "#4B4B6A" }}
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
            className="rounded-2xl border overflow-hidden backdrop-blur-md"
            style={{
              background: "rgba(10, 10, 20, 0.5)",
              borderColor: "rgba(255, 255, 255, 0.06)",
            }}
          >
            {/* Table top accent */}
            <div
              className="h-[1px] w-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,45,120,0.3), rgba(192,132,252,0.2), transparent)",
              }}
            />

            {filteredLeaderboard.length === 0 ? (
              <div
                className="p-16 text-center text-slate-600"
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
                        borderColor: "rgba(255,255,255,0.04)",
                        background: "rgba(255,255,255,0.01)",
                      }}
                    >
                      <th className="p-4 pl-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center w-20">
                        อันดับ
                      </th>
                      <th className="p-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        สมาชิก
                      </th>
                      <th className="p-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center w-32 hidden sm:table-cell">
                        เควสต์
                      </th>
                      <th className="p-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center w-32 hidden sm:table-cell">
                        วอร์
                      </th>
                      <th className="p-4 pr-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-right w-36">
                        คะแนนสุทธิ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaderboard.map((entry, index) => {
                      const isSelf = entry.isCurrentUser;
                      const rank = entry.rank;
                      const isTop3 = rank <= 3;

                      // ── Progressive opacity for rank 4+ ──
                      // rank 4 → 0.70, rank 5 → 0.60, rank 6 → 0.52 … floor at 0.28
                      const rowOpacity = isTop3 || isSelf
                        ? 1
                        : Math.max(0.28, 0.76 - (rank - 4) * 0.08);

                      // ── Name / accent colours ──
                      let nameColor = isSelf ? "#06B6D4" : "#64748B";
                      if (rank === 1) nameColor = "#FBBF24";
                      else if (rank === 2) nameColor = "#E2E8F0";
                      else if (rank === 3) nameColor = "#D97706";

                      // ── Avatar ring colours ──
                      let avatarBorder = "rgba(255,255,255,0.06)";
                      if (rank === 1) avatarBorder = "rgba(251,191,36,0.55)";
                      else if (rank === 2) avatarBorder = "rgba(226,232,240,0.4)";
                      else if (rank === 3) avatarBorder = "rgba(217,119,6,0.45)";
                      else if (isSelf) avatarBorder = "rgba(6,182,212,0.4)";

                      // ── Row background for top 3 ──
                      let rowBg = "transparent";
                      let rowBorderLeft = "none";
                      if (rank === 1) {
                        rowBg = "linear-gradient(90deg, rgba(251,191,36,0.10) 0%, rgba(251,191,36,0.04) 50%, transparent 100%)";
                        rowBorderLeft = "3px solid rgba(251,191,36,0.7)";
                      } else if (rank === 2) {
                        rowBg = "linear-gradient(90deg, rgba(226,232,240,0.07) 0%, rgba(226,232,240,0.02) 50%, transparent 100%)";
                        rowBorderLeft = "3px solid rgba(226,232,240,0.45)";
                      } else if (rank === 3) {
                        rowBg = "linear-gradient(90deg, rgba(217,119,6,0.09) 0%, rgba(217,119,6,0.03) 50%, transparent 100%)";
                        rowBorderLeft = "3px solid rgba(217,119,6,0.5)";
                      } else if (isSelf) {
                        rowBg = "linear-gradient(90deg, rgba(6,182,212,0.07) 0%, transparent 60%)";
                        rowBorderLeft = "3px solid rgba(6,182,212,0.4)";
                      }

                      // ── Points glow for top 3 ──
                      const ptsShadow =
                        rank === 1 ? "0 0 18px rgba(251,191,36,0.5)"
                        : rank === 2 ? "0 0 14px rgba(226,232,240,0.35)"
                        : rank === 3 ? "0 0 12px rgba(217,119,6,0.4)"
                        : isSelf ? "0 0 12px rgba(6,182,212,0.4)"
                        : "none";

                      const ptsColor =
                        rank === 1 ? "#FBBF24"
                        : rank === 2 ? "#E2E8F0"
                        : rank === 3 ? "#D97706"
                        : isSelf ? "#06B6D4"
                        : "#4B5563";

                      return (
                        <tr
                          key={entry.memberId}
                          className="transition-all duration-200 animate-row-fade-in"
                          style={{
                            background: rowBg,
                            borderLeft: rowBorderLeft,
                            borderBottom: isTop3
                              ? `1px solid rgba(255,255,255,0.05)`
                              : `1px solid rgba(255,255,255,0.025)`,
                            opacity: rowOpacity,
                            animationDelay: `${Math.min(index * 30, 300)}ms`,
                            animationFillMode: "both",
                          }}
                        >
                          {/* Rank */}
                          <td className="text-center" style={{ padding: isTop3 ? "18px 16px 18px 24px" : "12px 16px 12px 24px" }}>
                            <RankBadge rank={rank} />
                          </td>

                          {/* Member */}
                          <td style={{ padding: isTop3 ? "18px 16px" : "12px 16px" }}>
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                <Avatar
                                  url={entry.avatar}
                                  name={entry.inGameName}
                                  size={rank === 1 ? 46 : rank <= 3 ? 40 : 34}
                                  borderColor={avatarBorder}
                                />
                                {/* Gold/silver/bronze glow ring for top 3 */}
                                {rank <= 3 && (
                                  <span
                                    className="absolute inset-0 rounded-full pointer-events-none"
                                    style={{
                                      boxShadow:
                                        rank === 1 ? "0 0 16px rgba(251,191,36,0.45)"
                                        : rank === 2 ? "0 0 12px rgba(226,232,240,0.25)"
                                        : "0 0 12px rgba(217,119,6,0.35)",
                                    }}
                                  />
                                )}
                                {isSelf && (
                                  <span
                                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 animate-neon-pulse"
                                    style={{ background: "#06B6D4", borderColor: "#08080F" }}
                                  />
                                )}
                              </div>

                              <div>
                                <div
                                  className="font-bold"
                                  style={{
                                    fontFamily: "var(--font-noto)",
                                    fontSize: rank === 1 ? "17px" : rank <= 3 ? "15px" : "13px",
                                    color: nameColor,
                                    textShadow: rank === 1 ? "0 0 20px rgba(251,191,36,0.4)" : "none",
                                    letterSpacing: rank === 1 ? "0.01em" : "normal",
                                  }}
                                >
                                  {entry.inGameName}
                                </div>
                                <div
                                  className="text-[11px]"
                                  style={{
                                    fontFamily: "var(--font-noto)",
                                    color: isTop3 ? "rgba(255,255,255,0.35)" : "#2D2D42",
                                    marginTop: "2px",
                                  }}
                                >
                                  {entry.nickname}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Quests */}
                          <td className="text-center hidden sm:table-cell" style={{ padding: isTop3 ? "18px 16px" : "12px 16px" }}>
                            <span
                              className="font-mono font-bold"
                              style={{
                                fontSize: isTop3 ? "15px" : "13px",
                                color: entry.questCount > 0
                                  ? isTop3 ? "#34D399" : "rgba(52,211,153,0.55)"
                                  : "#1E1E2E",
                              }}
                            >
                              {entry.questCount}
                            </span>
                          </td>

                          {/* Wars */}
                          <td className="text-center hidden sm:table-cell" style={{ padding: isTop3 ? "18px 16px" : "12px 16px" }}>
                            <span
                              className="font-mono font-bold"
                              style={{
                                fontSize: isTop3 ? "15px" : "13px",
                                color: entry.warCount > 0
                                  ? isTop3 ? "#A78BFA" : "rgba(167,139,250,0.55)"
                                  : "#1E1E2E",
                              }}
                            >
                              {entry.warCount}
                            </span>
                          </td>

                          {/* Points */}
                          <td className="text-right" style={{ padding: isTop3 ? "18px 24px 18px 16px" : "12px 24px 12px 16px" }}>
                            <span
                              className="font-mono font-extrabold"
                              style={{
                                fontSize: rank === 1 ? "20px" : rank <= 3 ? "17px" : "13px",
                                color: ptsColor,
                                textShadow: ptsShadow,
                              }}
                            >
                              {entry.totalPoints.toLocaleString()}
                              <span
                                className="font-normal ml-1"
                                style={{ fontSize: "10px", color: isTop3 ? "rgba(255,255,255,0.25)" : "#2D2D42" }}
                              >
                                Pts
                              </span>
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
              className="sticky bottom-6 p-4 rounded-2xl border backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{
                background: "rgba(8, 8, 16, 0.92)",
                borderColor: "rgba(6,182,212,0.35)",
                boxShadow: "0 0 24px rgba(6,182,212,0.1), 0 16px 40px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold border"
                  style={{
                    background: "rgba(6,182,212,0.08)",
                    borderColor: "rgba(6,182,212,0.25)",
                    color: "#06B6D4",
                  }}
                >
                  #{currentUserEntry.rank}
                </div>
                <div className="flex items-center gap-3">
                  <Avatar
                    url={currentUserEntry.avatar}
                    name={currentUserEntry.inGameName}
                    size={38}
                    borderColor="rgba(6,182,212,0.3)"
                  />
                  <div>
                    <div
                      className="font-bold text-sm"
                      style={{ fontFamily: "var(--font-noto)", color: "#06B6D4" }}
                    >
                      {currentUserEntry.inGameName}
                    </div>
                    <div
                      className="text-[11px] text-slate-500"
                      style={{ fontFamily: "var(--font-noto)" }}
                    >
                      Quest {currentUserEntry.questCount} · War {currentUserEntry.warCount}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontFamily: "var(--font-noto)", color: "#4B4B6A", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  คะแนนสะสม
                </div>
                <div
                  className="text-xl font-mono font-extrabold"
                  style={{ color: "#06B6D4", textShadow: "0 0 16px rgba(6,182,212,0.4)" }}
                >
                  {currentUserEntry.totalPoints.toLocaleString()} Pts
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
