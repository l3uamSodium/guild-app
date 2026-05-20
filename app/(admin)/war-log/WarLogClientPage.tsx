"use client";

import { useState, useEffect, useTransition } from "react";
import { saveWarLogs } from "./actions";

interface MemberData {
  id: string;
  inGameName: string;
  nickname: string;
  role: string;
  avatar: string | null;
}

interface WarLogData {
  id: string;
  memberId: string;
  seasonId: string;
  date: string;
  status: "ATTENDED" | "MISSED";
}

interface WarLogClientPageProps {
  activeSeason: {
    id: string;
    monthYear: string;
    isOpen: boolean;
  } | null;
  activeMembers: MemberData[];
  initialWarLogs: WarLogData[];
}

function getLocalDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function WarLogClientPage({
  activeSeason,
  activeMembers,
  initialWarLogs,
}: WarLogClientPageProps) {
  const [warLogs, setWarLogs] = useState<WarLogData[]>(initialWarLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Setup date constraints based on season
  const dateConstraints = activeSeason ? (() => {
    const [year, month] = activeSeason.monthYear.split("-");
    const minDate = `${activeSeason.monthYear}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const maxDate = `${activeSeason.monthYear}-${String(lastDay).padStart(2, "0")}`;
    return { min: minDate, max: maxDate };
  })() : { min: "", max: "" };

  // 2. Select initial date: Today (if in season), else first day of season
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const todayStr = getLocalDateString(today);
    if (activeSeason && todayStr.startsWith(activeSeason.monthYear)) {
      return todayStr;
    }
    return activeSeason ? `${activeSeason.monthYear}-01` : "";
  });

  // 3. Track attendance state per member for selectedDate
  const [attendance, setAttendance] = useState<Record<string, "ATTENDED" | "MISSED">>({});

  useEffect(() => {
    if (!selectedDate || !activeSeason) return;

    // Find logs matching selectedDate (comparing YYYY-MM-DD parts)
    const logsForDate = warLogs.filter(
      (log) => log.date.split("T")[0] === selectedDate
    );

    const initialMap: Record<string, "ATTENDED" | "MISSED"> = {};
    activeMembers.forEach((member) => {
      const existing = logsForDate.find((l) => l.memberId === member.id);
      initialMap[member.id] = existing ? existing.status : "ATTENDED";
    });
    setAttendance(initialMap);
  }, [selectedDate, warLogs, activeMembers, activeSeason]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleStatusChange = (memberId: string, status: "ATTENDED" | "MISSED") => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: status,
    }));
  };

  const handleSelectAll = (status: "ATTENDED" | "MISSED") => {
    const newMap: Record<string, "ATTENDED" | "MISSED"> = {};
    filteredMembers.forEach((m) => {
      newMap[m.id] = status;
    });
    setAttendance((prev) => ({
      ...prev,
      ...newMap,
    }));
  };

  const handleSave = () => {
    if (!activeSeason || !selectedDate) {
      showNotification("error", "ไม่สามารถบันทึกได้ เนื่องจากไม่มีซีซันที่เปิดใช้งาน");
      return;
    }

    startTransition(async () => {
      const attendedMemberIds = Object.keys(attendance).filter(
        (id) => attendance[id] === "ATTENDED"
      );

      try {
        const result = await saveWarLogs(selectedDate, activeSeason.id, attendedMemberIds);
        if (result.success) {
          showNotification("success", "บันทึกข้อมูลกิลด์วอร์เรียบร้อยแล้ว!");
          
          // Update local state so switching dates works immediately without refetching
          const targetDateISO = new Date(selectedDate).toISOString();
          setWarLogs((prev) => {
            const filtered = prev.filter((log) => log.date.split("T")[0] !== selectedDate);
            const newLogs = activeMembers.map((m) => ({
              id: Math.random().toString(),
              memberId: m.id,
              seasonId: activeSeason.id,
              date: targetDateISO,
              status: attendance[m.id] || "MISSED",
            }));
            return [...filtered, ...newLogs];
          });
        }
      } catch (err: any) {
        showNotification("error", err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    });
  };

  // Filter list
  const filteredMembers = activeMembers.filter(
    (m) =>
      m.inGameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAttended = Object.values(attendance).filter((s) => s === "ATTENDED").length;
  const totalMissed = Object.values(attendance).filter((s) => s === "MISSED").length;

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

      {/* Notification Toast */}
      {notification && (
        <div
          className="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl border backdrop-filter backdrop-blur-lg flex items-center gap-3 shadow-2xl transition-all duration-300 animate-slide-in"
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
          <div>
            <div className="flex items-center gap-3">
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
                ONIZUKA
              </h1>
            </div>
            <p style={{ fontFamily: "var(--font-noto)", color: "#5B5B7A", fontSize: "14px", marginTop: "4px" }}>
              ระบบบันทึกคะแนนและการเข้าร่วมกิลด์วอร์รายวัน
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div
              className="px-5 py-3 rounded-2xl border"
              style={{
                background: "rgba(16,185,129,0.02)",
                borderColor: "rgba(16,185,129,0.1)",
              }}
            >
              <div style={{ color: "#5B5B7A", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>เข้าวอร์ (ATTENDED)</div>
              <div className="text-xl font-bold" style={{ color: "#10B981" }}>{totalAttended} คน</div>
            </div>
            <div
              className="px-5 py-3 rounded-2xl border"
              style={{
                background: "rgba(244,63,94,0.02)",
                borderColor: "rgba(244,63,94,0.1)",
              }}
            >
              <div style={{ color: "#5B5B7A", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>ไม่เข้าวอร์ (MISSED)</div>
              <div className="text-xl font-bold" style={{ color: "#FF6B9D" }}>{totalMissed} คน</div>
            </div>
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
            อนุมัติการพักกิจกรรม
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
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              fontFamily: "var(--font-noto)",
              background: "rgba(255,45,120,0.15)",
              border: "1px solid rgba(255,45,120,0.4)",
              color: "#FF6B9D",
            }}
          >
            บันทึกกิลด์วอร์
          </a>
          <a
            href="/admin/watchlist"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{ fontFamily: "var(--font-noto)" }}
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

        {/* Date Selector & Search Controller */}
        <div
          className="p-6 rounded-3xl border backdrop-blur-md space-y-4"
          style={{
            background: "rgba(10, 10, 18, 0.6)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Date Pick */}
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: "var(--font-noto)", color: "#94A3B8", fontSize: "14px" }}>
                ระบุวันที่ต้องการบันทึก:
              </span>
              {activeSeason ? (
                <input
                  type="date"
                  value={selectedDate}
                  min={dateConstraints.min}
                  max={dateConstraints.max}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 rounded-xl border text-sm font-semibold focus:outline-none transition-all"
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    borderColor: "rgba(255,45,120,0.2)",
                    color: "#FFFFFF",
                    fontFamily: "var(--font-noto)",
                  }}
                />
              ) : (
                <span style={{ fontFamily: "var(--font-noto)", color: "#F43F5E", fontSize: "14px", fontWeight: "bold" }}>
                  ยังไม่มีซีซันที่เปิดใช้งานในขณะนี้
                </span>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSelectAll("ATTENDED")}
                disabled={!activeSeason}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5 border border-slate-700 text-slate-300 disabled:opacity-40"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                ทำเครื่องหมายเข้าวอร์ทั้งหมด
              </button>
              <button
                onClick={() => handleSelectAll("MISSED")}
                disabled={!activeSeason}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5 border border-slate-700 text-slate-300 disabled:opacity-40"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                ทำเครื่องหมายไม่เข้าทั้งหมด
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้เล่น..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border focus:outline-none transition-all placeholder-slate-600 text-sm"
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

        {/* Member Grid List */}
        {!activeSeason ? (
          <div
            className="p-12 text-center rounded-3xl border"
            style={{
              background: "rgba(244,63,94,0.02)",
              borderColor: "rgba(244,63,94,0.08)",
            }}
          >
            <svg className="w-12 h-12 text-rose-500/40 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 style={{ fontFamily: "var(--font-cinzel)", color: "#FFFFFF", fontSize: "16px", fontWeight: "bold" }}>
              SEASON IS INACTIVE
            </h3>
            <p style={{ fontFamily: "var(--font-noto)", color: "#5B5B7A", fontSize: "14px", marginTop: "6px" }}>
              กรุณาเปิดใช้งานซีซันที่หน้า &quot;จัดการซีซัน&quot; ก่อนดำเนินการบันทึกข้อมูลกิลด์วอร์
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div
            className="p-12 text-center rounded-3xl border"
            style={{
              background: "rgba(255,255,255,0.01)",
              borderColor: "rgba(255,255,255,0.03)",
            }}
          >
            <p style={{ fontFamily: "var(--font-noto)", color: "#5B5B7A", fontSize: "14px" }}>
              ไม่พบรายชื่อสมาชิกที่ตรงกับเงื่อนไขการค้นหา
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMembers.map((member) => {
              const status = attendance[member.id] || "ATTENDED";
              const isAttended = status === "ATTENDED";

              return (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4"
                  style={{
                    background: "rgba(10, 10, 18, 0.4)",
                    borderColor: isAttended ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)",
                    boxShadow: isAttended
                      ? "inset 0 0 12px rgba(16,185,129,0.02)"
                      : "inset 0 0 12px rgba(244,63,94,0.02)",
                  }}
                >
                  {/* Left: Avatar & Nicknames */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase border"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        borderColor: "rgba(255,255,255,0.08)",
                        color: "#94A3B8",
                      }}
                    >
                      {member.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.avatar}
                          alt={member.inGameName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        member.inGameName.substring(0, 2)
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">{member.inGameName}</div>
                      <div className="text-xs text-slate-500">{member.nickname}</div>
                    </div>
                  </div>

                  {/* Right: ATTENDED / MISSED Status Toggle */}
                  <div className="flex gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5">
                    <button
                      onClick={() => handleStatusChange(member.id, "ATTENDED")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                        isAttended
                          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                          : "text-slate-500 hover:text-slate-300 border border-transparent"
                      }`}
                      style={{ fontFamily: "var(--font-noto)" }}
                    >
                      เข้าวอร์
                    </button>
                    <button
                      onClick={() => handleStatusChange(member.id, "MISSED")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                        !isAttended
                          ? "text-rose-400 bg-rose-500/10 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
                          : "text-slate-500 hover:text-slate-300 border border-transparent"
                      }`}
                      style={{ fontFamily: "var(--font-noto)" }}
                    >
                      ขาดวอร์
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sticky/Floating Bottom Saving panel */}
        {activeSeason && (
          <div
            className="sticky bottom-6 p-4 rounded-2xl border backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_-15px_30px_rgba(0,0,0,0.5)]"
            style={{
              background: "rgba(10, 10, 18, 0.85)",
              borderColor: "rgba(255,45,120,0.25)",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-noto)", color: "#FFFFFF", fontSize: "14px", fontWeight: "bold" }}>
                ยื่นยันข้อมูลบันทึกกิลด์วอร์สำหรับวันที่ {selectedDate}
              </div>
              <div style={{ fontFamily: "var(--font-noto)", color: "#94A3B8", fontSize: "12px", marginTop: "2px" }}>
                มีผู้เข้าร่วม {totalAttended} คน และผู้ขาดเข้าร่วม {totalMissed} คน ในซีซัน {activeSeason.monthYear}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative group overflow-hidden disabled:opacity-50"
              style={{
                fontFamily: "var(--font-noto)",
                background: "linear-gradient(135deg, #FF2D78 0%, #FF6B9D 100%)",
                boxShadow: "0 0 15px rgba(255,45,120,0.3)",
                color: "#FFFFFF",
              }}
            >
              {isPending ? "กำลังบันทึกข้อมูล..." : "บันทึกข้อมูลกิลด์วอร์"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
