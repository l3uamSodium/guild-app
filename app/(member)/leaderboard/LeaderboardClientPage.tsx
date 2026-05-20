"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

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
}

export default function LeaderboardClientPage({
  seasons,
  selectedSeasonId,
  leaderboard,
  currentMemberId,
}: LeaderboardClientPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSeasonChange = (seasonId: string) => {
    router.push(`${pathname}?season=${seasonId}`);
  };

  // Filter leaderboard based on search query
  const filteredLeaderboard = leaderboard.filter(
    (entry) =>
      entry.inGameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if current user is in the top 10 of the full leaderboard
  const isCurrentUserInTop10 = leaderboard.slice(0, 10).some((e) => e.isCurrentUser);
  const currentUserEntry = leaderboard.find((e) => e.isCurrentUser);

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);

  // Render Crown SVGs
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center">
          <svg
            className="w-6 h-6 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3 6 6-1-4 7 3 6H4l3-6-4-7 6 1z" />
          </svg>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center">
          <svg
            className="w-6 h-6 text-slate-300 drop-shadow-[0_0_6px_rgba(203,213,225,0.6)]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3 6 6-1-4 7 3 6H4l3-6-4-7 6 1z" />
          </svg>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center">
          <svg
            className="w-6 h-6 text-amber-700 drop-shadow-[0_0_6px_rgba(180,83,9,0.6)]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3 6 6-1-4 7 3 6H4l3-6-4-7 6 1z" />
          </svg>
        </div>
      );
    }
    return (
      <span className="text-slate-400 text-xs font-mono font-bold bg-slate-800/40 px-2 py-0.5 rounded-md border border-slate-700/50">
        #{rank}
      </span>
    );
  };

  return (
    <main
      className="min-h-screen relative overflow-hidden px-4 py-12 md:px-8"
      style={{ background: "#08080F" }}
    >
      {/* Background gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 30% 40%, rgba(255,45,120,0.05) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(88,101,242,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,45,120,0.4) 1px, transparent 0)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      {/* Top Glow Accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[2px] opacity-60"
        style={{ background: "linear-gradient(90deg, transparent, #FF2D78, transparent)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: "28px",
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
            <p style={{ fontFamily: "var(--font-noto)", color: "#5B5B7A", fontSize: "14px", marginTop: "4px" }}>
              ตารางคะแนนสะสมและอันดับความเก่งกาจของสมาชิกกิลด์ ONIZUKA
            </p>
          </div>

          {/* Quick Info */}
          {selectedSeason && (
            <div
              className="px-5 py-3 rounded-2xl border backdrop-blur-md"
              style={{
                background: "rgba(255,255,255,0.01)",
                borderColor: "rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ color: "#5B5B7A", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>ซีซันที่เลือก</div>
              <div className="text-md font-bold text-slate-200 mt-0.5" style={{ fontFamily: "var(--font-noto)" }}>
                {selectedSeason.isOpen ? "ซีซันปัจจุบัน " : "ซีซันปิดแล้ว "}({selectedSeason.monthYear})
              </div>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div
          className="p-6 rounded-3xl border backdrop-blur-md flex flex-col md:flex-row md:items-center gap-4"
          style={{
            background: "rgba(10, 10, 18, 0.6)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          {/* Season Selector */}
          <div className="flex flex-col gap-1.5 w-full md:w-1/3">
            <label style={{ fontFamily: "var(--font-noto)", color: "#94A3B8", fontSize: "12px" }}>
              เลือกซีซัน:
            </label>
            <select
              value={selectedSeasonId}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all cursor-pointer"
              style={{
                background: "rgba(0,0,0,0.4)",
                borderColor: "rgba(255,255,255,0.08)",
                color: "#FFFFFF",
                fontFamily: "var(--font-noto)",
              }}
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0A0A12] text-white">
                  ซีซันเดือน {s.monthYear} {s.isOpen ? "(เปิดอยู่)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Search Member */}
          <div className="flex flex-col gap-1.5 w-full md:w-2/3">
            <label style={{ fontFamily: "var(--font-noto)", color: "#94A3B8", fontSize: "12px" }}>
              ค้นหาสมาชิก:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาตามชื่อในเกม หรือชื่อเล่น..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none transition-all placeholder-slate-600 text-sm"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  borderColor: "rgba(255,255,255,0.06)",
                  color: "#FFFFFF",
                  fontFamily: "var(--font-noto)",
                }}
              />
              <svg
                className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-600"
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

        {/* Leaderboard Table */}
        <div
          className="rounded-3xl border overflow-hidden backdrop-blur-md"
          style={{
            background: "rgba(10, 10, 18, 0.4)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          {filteredLeaderboard.length === 0 ? (
            <div className="p-16 text-center text-slate-500" style={{ fontFamily: "var(--font-noto)" }}>
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
                      background: "rgba(255,255,255,0.01)",
                    }}
                  >
                    <th className="p-4 pl-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-20">อันดับ</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">สมาชิก</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-36">เควสต์สำเร็จ (10 pts)</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-36">เข้าร่วมวอร์ (50 pts)</th>
                    <th className="p-4 pr-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right w-36">คะแนนสุทธิ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredLeaderboard.map((entry) => {
                    const isSelf = entry.isCurrentUser;
                    return (
                      <tr
                        key={entry.memberId}
                        className={`transition-all duration-300 hover:bg-white/[0.02] ${
                          isSelf
                            ? "bg-cyan-500/[0.04] border-l-4 border-l-cyan-500 shadow-[inset_0_0_15px_rgba(6,182,212,0.05)]"
                            : ""
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="p-4 pl-6 text-center">{renderRankBadge(entry.rank)}</td>

                        {/* Member Details */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase border relative"
                              style={{
                                background: "rgba(255,255,255,0.02)",
                                borderColor: isSelf ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.08)",
                                color: isSelf ? "#06B6D4" : "#94A3B8",
                              }}
                            >
                              {entry.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={entry.avatar}
                                  alt={entry.inGameName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                entry.inGameName.substring(0, 2)
                              )}
                              {isSelf && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-[#08080F] animate-pulse" />
                              )}
                            </div>
                            <div>
                              <div
                                className={`font-bold text-sm ${isSelf ? "text-cyan-400" : "text-slate-200"}`}
                                style={{ fontFamily: "var(--font-noto)" }}
                              >
                                {entry.inGameName}
                              </div>
                              <div className="text-xs text-slate-500" style={{ fontFamily: "var(--font-noto)" }}>
                                {entry.nickname}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Quests Done */}
                        <td className="p-4 text-center">
                          <span
                            className="text-sm font-mono font-bold"
                            style={{ color: entry.questCount > 0 ? "#10B981" : "#475569" }}
                          >
                            {entry.questCount} ครั้ง
                          </span>
                        </td>

                        {/* Wars Attended */}
                        <td className="p-4 text-center">
                          <span
                            className="text-sm font-mono font-bold"
                            style={{ color: entry.warCount > 0 ? "#8B5CF6" : "#475569" }}
                          >
                            {entry.warCount} ครั้ง
                          </span>
                        </td>

                        {/* Net Points */}
                        <td className="p-4 pr-6 text-right">
                          <span
                            className={`text-md font-mono font-bold ${
                              isSelf ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" : "text-slate-100"
                            }`}
                          >
                            {entry.totalPoints.toLocaleString()} Pts
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

        {/* Sticky floating bottom user card */}
        {!isCurrentUserInTop10 && currentUserEntry && (
          <div
            className="sticky bottom-6 p-4 rounded-2xl border backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_-15px_30px_rgba(0,0,0,0.6)] animate-pulse"
            style={{
              background: "rgba(10, 10, 18, 0.9)",
              borderColor: "rgba(6,182,212,0.4)",
              boxShadow: "0 0 20px rgba(6,182,212,0.15)",
            }}
          >
            <div className="flex items-center gap-4">
              {/* Floating User Rank Info */}
              <div className="flex items-center justify-center bg-cyan-950/50 border border-cyan-500/30 px-3 py-1.5 rounded-xl font-mono text-cyan-400 font-bold text-xs">
                อันดับ #{currentUserEntry.rank}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase border"
                  style={{
                    background: "rgba(6,182,212,0.1)",
                    borderColor: "rgba(6,182,212,0.3)",
                    color: "#06B6D4",
                  }}
                >
                  {currentUserEntry.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUserEntry.avatar}
                      alt={currentUserEntry.inGameName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    currentUserEntry.inGameName.substring(0, 2)
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-cyan-400" style={{ fontFamily: "var(--font-noto)" }}>
                    {currentUserEntry.inGameName} (คุณ)
                  </div>
                  <div className="text-xs text-slate-500" style={{ fontFamily: "var(--font-noto)" }}>
                    ทำเควสต์ {currentUserEntry.questCount} ครั้ง | วอร์ {currentUserEntry.warCount} ครั้ง
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right sm:text-left">
              <span style={{ fontFamily: "var(--font-noto)", color: "#94A3B8", fontSize: "11px", textTransform: "uppercase" }}>
                คะแนนสะสมสุทธิ
              </span>
              <div className="text-xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                {currentUserEntry.totalPoints.toLocaleString()} Pts
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
