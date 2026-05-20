"use client";

interface AbsenteeWatchInfo {
  member: {
    id: string;
    inGameName: string;
    nickname: string;
    avatar: string | null;
  };
  absentCount: number;
  dates: string[];
}

interface LeaveWatchInfo {
  member: {
    id: string;
    inGameName: string;
    nickname: string;
    avatar: string | null;
  };
  leaveCount: number;
}

interface WatchlistClientPageProps {
  activeSeason: {
    id: string;
    monthYear: string;
    isOpen: boolean;
  } | null;
  absentees: AbsenteeWatchInfo[];
  leaveTakers: LeaveWatchInfo[];
}

export default function WatchlistClientPage({
  activeSeason,
  absentees,
  leaveTakers,
}: WatchlistClientPageProps) {
  
  // Find maximum leave count to scale comparative bars
  const maxLeaves = leaveTakers.length > 0 ? Math.max(...leaveTakers.map((l) => l.leaveCount)) : 1;

  const formatDateShort = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("th-TH", {
      month: "short",
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

      {/* Wrapper */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: "24px",
                fontWeight: 900,
                letterSpacing: "0.15em",
                background: "linear-gradient(135deg, #FFFFFF 20%, #FF6B9D 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
              }}
            >
              ONIZUKA WATCHLIST
            </h1>
            <p style={{ fontFamily: "var(--font-noto)", color: "#5B5B7A", fontSize: "14px", marginTop: "4px" }}>
              ระบบเฝ้าระวังพฤติกรรมการขาดทำเควสต์และการลาสะสมของสมาชิกกิลด์
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
            style={{ fontFamily: "var(--font-noto)" }}
          >
            จัดการสมาชิก
          </a>
          <a
            href="/seasons"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            จัดการซีซัน
          </a>
          <a
            href="/admin/leave"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            อนุมัติการลา
          </a>
          <a
            href="/quest-check"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            ตรวจเควสต์รายวัน
          </a>
          <a
            href="/admin/war-log"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            บันทึกกิลด์วอร์
          </a>
          <a
            href="/admin/watchlist"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              fontFamily: "var(--font-noto)",
              background: "rgba(255,45,120,0.15)",
              border: "1px solid rgba(255,45,120,0.4)",
              color: "#FF6B9D",
            }}
          >
            รายชื่อเฝ้าระวัง
          </a>
        </div>

        {/* Dashboard Grid split screen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Panel Left: Absentees */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#FF2D78",
                  letterSpacing: "0.05em",
                }}
              >
                ขาดบ่อย (7 วันย้อนหลัง)
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                เงื่อนไข: ขาดเควสต์ตั้งแต่ 3 วันขึ้นไป
              </span>
            </div>

            <div
              className="p-6 rounded-3xl border backdrop-blur-md space-y-4 min-h-[400px]"
              style={{
                background: "rgba(10, 10, 18, 0.6)",
                borderColor: "rgba(255,255,255,0.05)",
              }}
            >
              {absentees.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-cinzel)", color: "#FFFFFF", fontSize: "14px", fontWeight: "bold" }}>
                    NO ABSENT RISK
                  </h3>
                  <p style={{ fontFamily: "var(--font-noto)", color: "#5B5B7A", fontSize: "13px" }}>
                    สมาชิกทุกคนมีความรับผิดชอบสูง ไม่มีใครถูกบันทึกขาดทำเควสต์ถึงเกณฑ์เฝ้าระวัง
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {absentees.map((item) => (
                    <div
                      key={item.member.id}
                      className="p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-3"
                      style={{
                        background: "rgba(244,63,94,0.02)",
                        borderColor: "rgba(244,63,94,0.18)",
                        boxShadow: "inset 0 0 10px rgba(244,63,94,0.02)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase border border-rose-500/30"
                            style={{
                              background: "rgba(244,63,94,0.05)",
                              color: "#FF6B9D",
                            }}
                          >
                            {item.member.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.member.avatar}
                                alt={item.member.inGameName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              item.member.inGameName.substring(0, 2)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-rose-400" style={{ fontFamily: "var(--font-noto)" }}>
                              {item.member.inGameName}
                            </div>
                            <div className="text-xs text-slate-500" style={{ fontFamily: "var(--font-noto)" }}>
                              {item.member.nickname}
                            </div>
                          </div>
                        </div>

                        {/* Bad Attendance Badge */}
                        <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 font-mono text-rose-400 font-bold text-xs">
                          ขาดเควสต์ {item.absentCount} วัน
                        </div>
                      </div>

                      {/* Display exact absent dates */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-rose-500/10">
                        <span className="text-[11px] text-slate-500 mr-1" style={{ fontFamily: "var(--font-noto)" }}>
                          วันที่ขาด:
                        </span>
                        {item.dates.map((dateStr, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded bg-rose-950/20 border border-rose-800/30 text-rose-400 font-mono"
                          >
                            {formatDateShort(dateStr)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel Right: Leave Takers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#FFB03A",
                  letterSpacing: "0.05em",
                }}
              >
                สถิติการลาเยอะ (ซีซันนี้)
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                จัดอันดับการลาที่ได้รับอนุมัติสูงสุด
              </span>
            </div>

            <div
              className="p-6 rounded-3xl border backdrop-blur-md space-y-4 min-h-[400px]"
              style={{
                background: "rgba(10, 10, 18, 0.6)",
                borderColor: "rgba(255,255,255,0.05)",
              }}
            >
              {!activeSeason ? (
                <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-3">
                  <h3 style={{ fontFamily: "var(--font-cinzel)", color: "#FFFFFF", fontSize: "14px", fontWeight: "bold" }}>
                    SEASON IS INACTIVE
                  </h3>
                  <p style={{ fontFamily: "var(--font-noto)", color: "#5B5B7A", fontSize: "13px" }}>
                    ไม่มีข้อมูล เนื่องจากไม่มีซีซันที่เปิดใช้งานอยู่ในตอนนี้
                  </p>
                </div>
              ) : leaveTakers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-cinzel)", color: "#FFFFFF", fontSize: "14px", fontWeight: "bold" }}>
                    NO LEAVE DATA
                  </h3>
                  <p style={{ fontFamily: "var(--font-noto)", color: "#5B5B7A", fontSize: "13px" }}>
                    ไม่มีประวัติการส่งคำขอลาที่ได้รับอนุมัติในซีซันนี้
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {leaveTakers.map((item) => {
                    const percentage = Math.min((item.leaveCount / maxLeaves) * 100, 100);
                    return (
                      <div
                        key={item.member.id}
                        className="p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-3"
                        style={{
                          background: "rgba(255,176,58,0.01)",
                          borderColor: "rgba(255,176,58,0.1)",
                          boxShadow: "inset 0 0 10px rgba(255,176,58,0.01)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase border border-amber-500/20"
                              style={{
                                background: "rgba(255,176,58,0.03)",
                                color: "#FFD08A",
                              }}
                            >
                              {item.member.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.member.avatar}
                                  alt={item.member.inGameName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                item.member.inGameName.substring(0, 2)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-amber-400" style={{ fontFamily: "var(--font-noto)" }}>
                                {item.member.inGameName}
                              </div>
                              <div className="text-xs text-slate-500" style={{ fontFamily: "var(--font-noto)" }}>
                                {item.member.nickname}
                              </div>
                            </div>
                          </div>

                          <div className="font-mono text-amber-400 font-bold text-sm">
                            ลาสะสม {item.leaveCount} วัน
                          </div>
                        </div>

                        {/* Comparative graphical gauge */}
                        <div className="w-full h-1.5 rounded-full bg-slate-950/60 overflow-hidden border border-white/5">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              background: "linear-gradient(90deg, #D97706 0%, #FFB03A 100%)",
                              boxShadow: "0 0 8px rgba(255,176,58,0.4)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
