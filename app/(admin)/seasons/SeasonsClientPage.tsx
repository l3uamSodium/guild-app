"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { openSeason, closeSeason } from "./actions";

interface SeasonSnapshot {
  id: string;
  data: {
    mvp: string;
    topMembers: string[];
    stats: {
      totalMembers: number;
      doneQuests: number;
      absentQuests: number;
      leaveQuests: number;
    };
  };
}

interface SeasonData {
  id: string;
  monthYear: string;
  isOpen: boolean;
  createdAt: string;
  closedAt: string | null;
  snapshot: SeasonSnapshot | null;
}

interface SeasonsClientPageProps {
  initialSeasons: SeasonData[];
  userRole: string;
}

export default function SeasonsClientPage({
  initialSeasons,
  userRole,
}: SeasonsClientPageProps) {
  const [seasons, setSeasons] = useState<SeasonData[]>(initialSeasons);
  const [newMonthYear, setNewMonthYear] = useState("");
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [selectedHistorySeason, setSelectedHistorySeason] = useState<SeasonData | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isGuildMaster = userRole === "GUILD_MASTER";
  const activeSeason = seasons.find((s) => s.isOpen);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleOpenSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGuildMaster) {
      showNotification("error", "เฉพาะบทบาท Guild Master เท่านั้นที่สามารถทำรายการนี้ได้");
      return;
    }

    if (!newMonthYear) {
      showNotification("error", "กรุณาเลือกเดือนและปี");
      return;
    }

    startTransition(async () => {
      try {
        const result = await openSeason(newMonthYear);
        if (result.success && result.season) {
          showNotification("success", `เปิด Season ${newMonthYear} เรียบร้อยแล้ว!`);
          
          const newSeasonData: SeasonData = {
            id: result.season.id,
            monthYear: result.season.monthYear,
            isOpen: result.season.isOpen,
            createdAt: result.season.createdAt.toISOString(),
            closedAt: null,
            snapshot: null,
          };
          
          setSeasons((prev) => [newSeasonData, ...prev]);
          setNewMonthYear("");
        }
      } catch (err: any) {
        showNotification("error", err.message || "เกิดข้อผิดพลาดในการเปิด Season");
      }
    });
  };

  const handleCloseSeason = async () => {
    if (!isGuildMaster) {
      showNotification("error", "เฉพาะบทบาท Guild Master เท่านั้นที่สามารถทำรายการนี้ได้");
      return;
    }

    if (!activeSeason) return;

    if (
      confirm(
        `คุณต้องการปิด Season "${activeSeason.monthYear}" ใช่หรือไม่?\nการปิด Season จะทำการเก็บข้อมูลสถิติประจำเดือน และไม่สามารถเปิดซ้ำได้`
      )
    ) {
      startTransition(async () => {
        try {
          const result = await closeSeason();
          if (result.success && result.season) {
            showNotification("success", `ปิด Season ${activeSeason.monthYear} และบันทึกประวัติแล้ว!`);
            
            setSeasons((prev) =>
              prev.map((s) =>
                s.id === activeSeason.id
                  ? {
                      ...s,
                      isOpen: false,
                      closedAt: result.season.closedAt ? result.season.closedAt.toISOString() : new Date().toISOString(),
                      snapshot: {
                        id: "temp-snapshot-id",
                        data: {
                          mvp: "TBD",
                          topMembers: [],
                          stats: {
                            totalMembers: 0,
                            doneQuests: 0,
                            absentQuests: 0,
                            leaveQuests: 0,
                          },
                        },
                      },
                    }
                  : s
              )
            );
          }
        } catch (err: any) {
          showNotification("error", err.message || "เกิดข้อผิดพลาดในการปิด Season");
        }
      });
    }
  };

  const formatMonthYear = (myStr: string) => {
    const [year, month] = myStr.split("-");
    const monthNames = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex]} ${parseInt(year, 10) + 543}`;
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          background: "radial-gradient(ellipse 60% 60% at 30% 40%, rgba(192,132,252,0.05) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(244,114,182,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(192,132,252,0.4) 1px, transparent 0)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      {/* Top Glow Accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[2px] opacity-60"
        style={{ background: "linear-gradient(90deg, transparent, #C084FC, transparent)" }}
      />

      {/* Notification Toast */}
      {notification && (
        <div
          className="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl border backdrop-filter backdrop-blur-lg flex items-center gap-3 shadow-2xl transition-all duration-300 "
          style={{
            background: notification.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            borderColor: notification.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
          }}
        >
          {notification.type === "success" ? (
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span style={{ fontFamily: "var(--font-noto)", fontSize: "14px", color: "#E4E4F0" }}>
            {notification.message}
          </span>
        </div>
      )}

      {/* Wrapper */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: "26px",
                fontWeight: 900,
                letterSpacing: "0.08em",
                background: "linear-gradient(135deg, #FFFFFF 20%, #C084FC 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SEASON MANAGEMENT
            </h1>
            <p style={{ color: "#8888A8", fontSize: "14px" }}>
              เปิดและปิดกิลด์ซีซั่นเพื่อบันทึกข้อมูลและสถิติรายเดือน
            </p>
          </div>
        </div>

        {/* Admin Navigation Command Bar */}
        <div
          className="flex flex-wrap gap-2 p-2 rounded-2xl border"
          style={{
            background: "rgba(255,255,255,0.01)",
            borderColor: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(10px)",
          }}
        >
          <a
            href="/members"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            จัดการสมาชิก
          </a>
          <a
            href="/seasons"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              fontFamily: "var(--font-noto)",
              background: "rgba(255,45,120,0.15)",
              border: "1px solid rgba(255,45,120,0.4)",
              color: "#FF6B9D",
            }}
          >
            จัดการซีซัน
          </a>
          <a
            href="/admin/leave"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            อนุมัติการพักกิจกรรม
          </a>
          <a
            href="/quest-check"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            ตรวจเควสต์รายวัน
          </a>
          <a
            href="/admin/war-log"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            บันทึกกิลด์วอร์
          </a>
          <a
            href="/admin/watchlist"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            รายชื่อเฝ้าระวัง
          </a>
          <a
            href="/admin/shop"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            จัดการร้านค้า
          </a>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border gap-6">
          <button
            onClick={() => setActiveTab("current")}
            className="pb-3 text-sm font-semibold relative transition-colors duration-300"
            style={{
              color: activeTab === "current" ? "#C084FC" : "#8888A8",
            }}
          >
            ซีซั่นปัจจุบัน
            {activeTab === "current" && (
              <span
                className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full shadow-[0_0_8px_#C084FC]"
                style={{ background: "#C084FC" }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className="pb-3 text-sm font-semibold relative transition-colors duration-300"
            style={{
              color: activeTab === "history" ? "#C084FC" : "#8888A8",
            }}
          >
            ประวัติซีซั่น
            {activeTab === "history" && (
              <span
                className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full shadow-[0_0_8px_#C084FC]"
                style={{ background: "#C084FC" }}
              />
            )}
          </button>
        </div>

        {/* Tab 1: Current Season */}
        {activeTab === "current" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Status Panel */}
            <div
              className="md:col-span-2 relative p-8 rounded-3xl overflow-hidden flex flex-col justify-between min-h-[300px]"
              style={{
                background: "rgba(26, 26, 36, 0.4)",
                border: "1px solid rgba(192, 132, 252, 0.15)",
                backdropFilter: "blur(24px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
              }}
            >
              {/* Decorative accents */}
              <span className="absolute top-0 left-0 w-6 h-6 border-t border-l" style={{ borderColor: "rgba(192, 132, 252, 0.3)" }} />
              <span className="absolute top-0 right-0 w-6 h-6 border-t border-r" style={{ borderColor: "rgba(192, 132, 252, 0.3)" }} />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b border-l" style={{ borderColor: "rgba(192, 132, 252, 0.3)" }} />
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b border-r" style={{ borderColor: "rgba(192, 132, 252, 0.3)" }} />

              {activeSeason ? (
                <>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className=" absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-emerald-400 font-semibold tracking-wider text-xs uppercase">
                        ACTIVE SEASON
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h2
                        style={{
                          fontSize: "36px",
                          fontWeight: 800,
                          color: "#FFFFFF",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {formatMonthYear(activeSeason.monthYear)}
                      </h2>
                      <p style={{ color: "#8888A8", fontSize: "14px" }}>
                        เปิดกิลด์ซีซั่นเมื่อวันที่ {formatDate(activeSeason.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="text-xs text-[#8888A8] space-y-1">
                      <p>สิทธิ์ในการปิดซีซั่น: <span className="text-primary font-semibold">Guild Master</span></p>
                      <p>ระบบจะสร้างรายงานสถิติประจำเดือนแบบสรุปทันทีหลังปิด</p>
                    </div>

                    {isGuildMaster ? (
                      <button
                        onClick={handleCloseSeason}
                        disabled={isPending}
                        className="px-6 py-3 rounded-xl border text-sm font-bold tracking-wide transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          borderColor: "rgba(239, 68, 68, 0.35)",
                          color: "#F87171",
                          boxShadow: "0 0 15px rgba(239,68,68,0.1)",
                        }}
                      >
                        {isPending ? "กำลังบันทึกและปิด..." : "ปิดกิลด์ซีซั่นนี้"}
                      </button>
                    ) : (
                      <div className="px-4 py-2.5 rounded-xl text-xs text-amber-400 border border-amber-500/20 bg-amber-500/5">
                        เฉพาะ Guild Master เท่านั้นที่มีสิทธิ์ปิดซีซั่น
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col justify-between h-full space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-text-faint"></span>
                      </span>
                      <span className="text-[#8888A8] font-semibold tracking-wider text-xs uppercase">
                        NO ACTIVE SEASON
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h2
                        style={{
                          fontSize: "28px",
                          fontWeight: 800,
                          color: "#E4E4F0",
                        }}
                      >
                        ไม่มีกิลด์ซีซั่นเปิดทำงานอยู่
                      </h2>
                      <p style={{ color: "#8888A8", fontSize: "14px" }}>
                        ต้องเปิดกิลด์ซีซั่นก่อน จึงจะสามารถทำเควสรายวัน ส่งคำขอพักกิจกรรม หรือทำกิจกรรมกิลด์ต่างๆ ได้
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-amber-400 border border-amber-500/20 bg-amber-500/5 px-4 py-3 rounded-2xl">
                    กรุณาเปิดกิลด์ซีซั่นใหม่ที่พาเนลด้านขวาเพื่อเริ่มรอบกิจกรรมใหม่
                  </div>
                </div>
              )}
            </div>

            {/* Action Panel */}
            <div
              className="p-8 rounded-3xl overflow-hidden flex flex-col justify-between"
              style={{
                background: "rgba(26, 26, 36, 0.4)",
                border: "1px solid rgba(192, 132, 252, 0.15)",
                backdropFilter: "blur(24px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
              }}
            >
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {activeSeason ? "ข้อมูลทั่วไป" : "เริ่มต้น Season ใหม่"}
                </h3>

                {activeSeason ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border border-border/40 bg-surface/30 space-y-1">
                      <p className="text-xs text-[#8888A8]">รูปแบบเก็บข้อมูล</p>
                      <p className="text-sm font-semibold text-white">แยกสถิติรายเดือน</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-border/40 bg-surface/30 space-y-1">
                      <p className="text-xs text-[#8888A8]">ระบบเควสรายวัน</p>
                      <p className="text-sm font-semibold text-emerald-400">พร้อมทำงาน</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-border/40 bg-surface/30 space-y-1">
                      <p className="text-xs text-[#8888A8]">ระบบแจ้งขอพักกิจกรรม</p>
                      <p className="text-sm font-semibold text-emerald-400">พร้อมทำงาน</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleOpenSeason} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#8888A8] uppercase tracking-wider block">
                        เลือกเดือนและปีสำหรับซีซั่น
                      </label>
                      <input
                        type="month"
                        value={newMonthYear}
                        onChange={(e) => setNewMonthYear(e.target.value)}
                        disabled={isPending || !isGuildMaster}
                        className="w-full px-4 py-3 rounded-xl border border-border/60 bg-[#0F0F14]/60 text-white font-medium focus:border-primary focus:outline-none transition duration-300"
                        style={{
                          colorScheme: "dark",
                        }}
                      />
                    </div>

                    {isGuildMaster ? (
                      <button
                        type="submit"
                        disabled={isPending || !newMonthYear}
                        className="w-full py-3.5 rounded-xl border text-sm font-bold tracking-wider transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        style={{
                          background: "rgba(192, 132, 252, 0.15)",
                          borderColor: "rgba(192, 132, 252, 0.35)",
                          color: "#C084FC",
                          boxShadow: "0 0 20px rgba(192,132,252,0.1)",
                        }}
                      >
                        {isPending ? "กำลังเปิดซีซั่น..." : "เปิดซีซั่นใหม่"}
                      </button>
                    ) : (
                      <div className="text-xs text-center text-[#8888A8] p-4 border border-border/40 bg-surface/20 rounded-2xl">
                        เฉพาะสิทธิ์ <span className="text-primary font-semibold">Guild Master</span> เท่านั้นที่เปิดใช้งานซีซั่นใหม่ได้
                      </div>
                    )}
                  </form>
                )}
              </div>

              <div className="pt-6 text-xs text-[#8888A8] leading-relaxed">
                กิลด์ซีซั่นจะจัดกลุ่มบันทึกทั้งหมด (Quest Log, Leaves, War Log) เพื่อนำไปคำนวณคะแนนสำหรับแลกไอดีหรือของรางวัล
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Seasons History */}
        {activeTab === "history" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Seasons List (Left side) */}
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-sm font-semibold text-[#8888A8] uppercase tracking-wider">
                ประวัติรายการที่ผ่านมา
              </h3>

              <div className="space-y-3">
                {seasons.filter((s) => !s.isOpen).length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-border/40 bg-surface/10 text-[#8888A8] text-sm">
                    ไม่มีประวัติซีซั่นในระบบ
                  </div>
                ) : (
                  seasons
                    .filter((s) => !s.isOpen)
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedHistorySeason(s)}
                        className="w-full text-left p-5 rounded-2xl border transition-all duration-300 hover:brightness-110"
                        style={{
                          background: selectedHistorySeason?.id === s.id ? "rgba(192, 132, 252, 0.08)" : "rgba(26,26,36,0.3)",
                          borderColor: selectedHistorySeason?.id === s.id ? "rgba(192, 132, 252, 0.3)" : "rgba(228,228,240,0.08)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-base">
                            {formatMonthYear(s.monthYear)}
                          </span>
                          <span className="text-xs text-[#8888A8]">
                            {s.monthYear}
                          </span>
                        </div>
                        <p className="text-xs text-[#8888A8]">
                          ปิดซีซั่น: {s.closedAt ? formatDate(s.closedAt) : "-"}
                        </p>
                      </button>
                    ))
                )}
              </div>
            </div>

            {/* Snapshot Details (Right side) */}
            <div className="md:col-span-2">
              {selectedHistorySeason ? (
                <div
                  className="p-8 rounded-3xl overflow-hidden space-y-8 relative"
                  style={{
                    background: "rgba(26, 26, 36, 0.4)",
                    border: "1px solid rgba(192, 132, 252, 0.15)",
                    backdropFilter: "blur(24px)",
                  }}
                >
                  {/* Decorative accents */}
                  <span className="absolute top-0 left-0 w-6 h-6 border-t border-l" style={{ borderColor: "rgba(192, 132, 252, 0.3)" }} />
                  <span className="absolute top-0 right-0 w-6 h-6 border-t border-r" style={{ borderColor: "rgba(192, 132, 252, 0.3)" }} />
                  <span className="absolute bottom-0 left-0 w-6 h-6 border-b border-l" style={{ borderColor: "rgba(192, 132, 252, 0.3)" }} />
                  <span className="absolute bottom-0 right-0 w-6 h-6 border-b border-r" style={{ borderColor: "rgba(192, 132, 252, 0.3)" }} />

                  <div className="border-b border-border/40 pb-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white">
                        รายงานซีซั่น {formatMonthYear(selectedHistorySeason.monthYear)}
                      </h3>
                      <p className="text-xs text-[#8888A8]">
                        ช่วงเวลาทำงาน: {formatDate(selectedHistorySeason.createdAt)} ถึง {selectedHistorySeason.closedAt ? formatDate(selectedHistorySeason.closedAt) : "-"}
                      </p>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full border border-border bg-surface/60 text-xs font-semibold text-[#8888A8]">
                      CLOSED
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl border border-border/40 bg-surface/30 text-center space-y-1">
                      <p className="text-xs text-[#8888A8] uppercase tracking-wider">สมาชิกทั้งหมด</p>
                      <p className="text-2xl font-black text-white">
                        {selectedHistorySeason.snapshot?.data?.stats?.totalMembers ?? 0}
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl border border-border/40 bg-surface/30 text-center space-y-1">
                      <p className="text-xs text-[#8888A8] uppercase tracking-wider">ผ่านเควส (ครั้ง)</p>
                      <p className="text-2xl font-black text-emerald-400">
                        {selectedHistorySeason.snapshot?.data?.stats?.doneQuests ?? 0}
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl border border-border/40 bg-surface/30 text-center space-y-1">
                      <p className="text-xs text-[#8888A8] uppercase tracking-wider">ขาดส่ง (ครั้ง)</p>
                      <p className="text-2xl font-black text-rose-400">
                        {selectedHistorySeason.snapshot?.data?.stats?.absentQuests ?? 0}
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl border border-border/40 bg-surface/30 text-center space-y-1">
                      <p className="text-xs text-[#8888A8] uppercase tracking-wider">พักกิจกรรม (ครั้ง)</p>
                      <p className="text-2xl font-black text-amber-400">
                        {selectedHistorySeason.snapshot?.data?.stats?.leaveQuests ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                      สถิติเกียรติยศประจำเดือน (Monthly Awards)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl border border-border/40 bg-surface/20 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-[#8888A8]">MVP ซีซั่น</p>
                          <p className="text-sm font-bold text-white">
                            {selectedHistorySeason.snapshot?.data?.mvp || "ไม่มีข้อมูล"}
                          </p>
                        </div>
                        <svg className="w-8 h-8 text-primary opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.052 12.93a4.898 4.898 0 004.087-.041m-5.127 1.83a4.9 4.9 0 005.16 0M10.35 15h3.3m-1.8 1.8a4.9 4.9 0 00-3.3 0M4.5 16.5h15M6.35 4.5h11.3M8.1 4.5l-.6 6m8.4-6l.6 6M12 10.5v9" />
                        </svg>
                      </div>

                      <div className="p-5 rounded-2xl border border-border/40 bg-surface/20 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-[#8888A8]">อัตราการส่งเควสเฉลี่ย</p>
                          <p className="text-sm font-bold text-emerald-400">
                            {selectedHistorySeason.snapshot?.data?.stats
                              ? (() => {
                                  const { doneQuests, absentQuests, leaveQuests } = selectedHistorySeason.snapshot.data.stats;
                                  const total = doneQuests + absentQuests + leaveQuests;
                                  if (total === 0) return "0%";
                                  return `${Math.round((doneQuests / total) * 100)}%`;
                                })()
                              : "0%"}
                          </p>
                        </div>
                        <svg className="w-8 h-8 text-emerald-400 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-12 rounded-3xl border border-border/40 bg-surface/10 text-[#8888A8] text-sm">
                  เลือกรายการประวัติซีซั่นด้านซ้ายเพื่อดูสถิติและรายงาน
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
