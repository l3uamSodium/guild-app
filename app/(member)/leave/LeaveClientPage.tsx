"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createLeaveRequest } from "@/app/actions/leave";
import MemberNavbar from "@/components/features/MemberNavbar";

interface LeaveHistoryItem {
  id: string;
  date: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface LeaveClientPageProps {
  initialHistory: LeaveHistoryItem[];
  hasActiveSeason: boolean;
  currentSeasonMonthYear: string | null;
  memberInfo: {
    inGameName: string;
    role: string;
    avatarUrl: string | null;
    points?: number;
    maxPoints?: number;
  };
}

export default function LeaveClientPage({
  initialHistory,
  hasActiveSeason,
  currentSeasonMonthYear,
  memberInfo,
}: LeaveClientPageProps) {
  const [history, setHistory] = useState<LeaveHistoryItem[]>(initialHistory);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // คำนวณวันขั้นต่ำสำหรับ min attribute (ห้ามเลือกวันย้อนหลัง)
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // คำนวณวันสูงสุดสำหรับ max attribute (ให้เลือกได้แค่ในเดือนของซีซั่นปัจจุบัน)
  const getMaxDateString = () => {
    if (!currentSeasonMonthYear) return undefined;
    const [year, month] = currentSeasonMonthYear.split("-");
    const lastDay = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
    return `${year}-${month.padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasActiveSeason) {
      showNotification("error", "ไม่สามารถพักกิจกรรมได้ เนื่องจากระบบกิลด์ไม่มีซีซั่นที่เปิดใช้งานในขณะนี้");
      return;
    }

    if (!date) {
      showNotification("error", "กรุณาระบุวันที่ต้องการพักกิจกรรม");
      return;
    }

    if (!reason.trim()) {
      showNotification("error", "กรุณากรอกเหตุผลในการพักกิจกรรม");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createLeaveRequest(date, reason);
        if (result.success && result.leave) {
          showNotification("success", "ส่งคำขอพักกิจกรรมเรียบร้อยแล้ว! กรุณารอแอดมินอนุมัติ");
          
          const newLeave: LeaveHistoryItem = {
            id: result.leave.id,
            date: result.leave.date.toISOString(),
            reason: result.leave.reason,
            status: result.leave.status as "PENDING",
            createdAt: result.leave.createdAt.toISOString(),
          };
          
          setHistory((prev) => [newLeave, ...prev]);
          setDate("");
          setReason("");
        }
      } catch (err: any) {
        showNotification("error", err.message || "เกิดข้อผิดพลาดในการส่งคำขอพักกิจกรรม");
      }
    });
  };

  const formatMonthYear = (myStr: string | null) => {
    if (!myStr) return "-";
    const [year, month] = myStr.split("-");
    const monthNames = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(year, 10) + 543}`;
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: "PENDING" | "APPROVED" | "REJECTED") => {
    switch (status) {
      case "PENDING":
        return (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              background: "rgba(250, 204, 21, 0.1)",
              borderColor: "rgba(250, 204, 21, 0.25)",
              color: "#FACC15",
            }}
          >
            กำลังตรวจสอบ
          </span>
        );
      case "APPROVED":
        return (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              background: "rgba(74, 222, 128, 0.1)",
              borderColor: "rgba(74, 222, 128, 0.25)",
              color: "#4ADE80",
            }}
          >
            อนุมัติพักกิจกรรม
          </span>
        );
      case "REJECTED":
        return (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              background: "rgba(248, 113, 113, 0.1)",
              borderColor: "rgba(248, 113, 113, 0.25)",
              color: "#F87171",
            }}
          >
            ไม่อนุมัติ
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#08080F" }}>
      <MemberNavbar
        avatarUrl={memberInfo.avatarUrl}
        inGameName={memberInfo.inGameName}
        role={memberInfo.role}
        points={memberInfo.points}
        maxPoints={memberInfo.maxPoints}
      />

      <main
        className="flex-1 relative overflow-hidden px-4 pt-28 pb-12 md:px-8"
      >
        {/* Background gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 30% 40%, rgba(244,114,182,0.04) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(88,101,242,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(244,114,182,0.4) 1px, transparent 0)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      {/* Top Glow Accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[2px] opacity-60"
        style={{ background: "linear-gradient(90deg, transparent, #F472B6, transparent)" }}
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
      <div className="relative z-10 max-w-7xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ animationDelay: '0ms' }}>
          <div className="space-y-1">
            <h1
              className="text-3xl sm:text-4xl font-extrabold truncate tracking-tight"
              style={{
                fontFamily: "var(--font-cinzel)",
                background: "linear-gradient(135deg, #F472B6 0%, #E879F9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 10px rgba(244,114,182,0.4)"
              }}
            >
              REQUEST BREAK
            </h1>
            <p style={{ color: "#8888A8", fontSize: "14px", marginTop: "4px", fontFamily: "var(--font-noto)" }}>
              แจ้งขอพักกิจกรรมกิลด์หรือเควสต์ประจำวันล่วงหน้า
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 auto-rows-auto gap-6">
          {/* Submit Leave Form (Left Column) */}
          <div
            className="lg:col-span-5 p-8 rounded-3xl overflow-hidden relative flex flex-col justify-between animate-fade-in"
            style={{
              animationDelay: '100ms',
              background: "rgba(26, 26, 36, 0.4)",
              border: "1px solid rgba(244, 114, 182, 0.15)",
              backdropFilter: "blur(24px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
            }}
          >
            {/* Corner accents */}
            <span className="absolute top-0 left-0 w-6 h-6 border-t border-l" style={{ borderColor: "rgba(244, 114, 182, 0.3)" }} />
            <span className="absolute top-0 right-0 w-6 h-6 border-t border-r" style={{ borderColor: "rgba(244, 114, 182, 0.3)" }} />
            <span className="absolute bottom-0 left-0 w-6 h-6 border-b border-l" style={{ borderColor: "rgba(244, 114, 182, 0.3)" }} />
            <span className="absolute bottom-0 right-0 w-6 h-6 border-b border-r" style={{ borderColor: "rgba(244, 114, 182, 0.3)" }} />

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  แจ้งพักกิจกรรมกิลด์
                </h3>
                {hasActiveSeason ? (
                  <p className="text-xs text-[#8888A8]">
                    ยื่นสำหรับรอบซีซั่น: <span className="text-accent font-semibold">{formatMonthYear(currentSeasonMonthYear)}</span>
                  </p>
                ) : (
                  <p className="text-xs text-rose-400 font-semibold">
                    ระบบยังไม่มีกิลด์ซีซั่นเปิดใช้งาน
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8888A8] uppercase tracking-wider block">
                    วันที่ต้องการพัก
                  </label>
                  <input
                    type="date"
                    min={getTodayDateString()}
                    max={getMaxDateString()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={isPending || !hasActiveSeason}
                    className="w-full px-4 py-3 rounded-xl border border-border/60 bg-[#0F0F14]/60 text-white font-medium focus:border-accent focus:outline-none transition duration-300"
                    style={{
                      colorScheme: "dark",
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8888A8] uppercase tracking-wider block">
                    เหตุผลในการพักกิจกรรม
                  </label>
                  <textarea
                    rows={4}
                    placeholder="ระบุความจำเป็น เช่น ติดภารกิจเรียน/งานด่วน, ต่างจังหวัด, ป่วย..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isPending || !hasActiveSeason}
                    className="w-full px-4 py-3 rounded-xl border border-border/60 bg-[#0F0F14]/60 text-white font-medium placeholder-[#4B4B6A] focus:border-accent focus:outline-none transition duration-300 resize-none text-sm leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending || !hasActiveSeason || !date || !reason.trim()}
                  className="w-full py-3.5 rounded-xl border text-sm font-bold tracking-wider transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: "rgba(244, 114, 182, 0.12)",
                    borderColor: "rgba(244, 114, 182, 0.35)",
                    color: "#F472B6",
                    boxShadow: "0 0 20px rgba(244,114,182,0.06)",
                  }}
                >
                  {isPending ? "กำลังส่งคำขอ..." : "แจ้งขอพักกิจกรรม"}
                </button>
              </form>
            </div>

            <div className="pt-6 border-t border-border/40 text-xs text-[#8888A8] leading-relaxed mt-6">
              * การพักกิจกรรมกิลด์เมื่อได้รับการอนุมัติ จะได้รับการยกเว้นจากการบันทึกขาดส่งเควสต์ประจำวันนั้น
            </div>
          </div>

          {/* History of Leave Requests (Right Column) */}
          <div className="lg:col-span-7 flex flex-col gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 px-1">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-pink-400 to-rose-600" />
              <h3 className="text-base font-bold text-white tracking-wide" style={{ fontFamily: "var(--font-noto)" }}>
                ประวัติและสถานะการขอพักกิจกรรมของคุณในซีซั่นนี้
              </h3>
            </div>

            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
              {history.length === 0 ? (
                <div 
                  className="p-12 text-center rounded-3xl border text-[#8888A8] text-sm"
                  style={{
                    background: "rgba(30,15,25,0.2)",
                    borderColor: "rgba(244, 114, 182, 0.1)",
                    fontFamily: "var(--font-noto)",
                  }}
                >
                  ไม่มีประวัติการขอพักกิจกรรมในซีซั่นนี้
                </div>
              ) : (
                history.map((h) => (
                  <div
                    key={h.id}
                    className="p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-500 hover:shadow-[0_4px_20px_rgba(244,114,182,0.1)] group"
                    style={{
                      background: "linear-gradient(145deg, rgba(30,15,25,0.4) 0%, rgba(15,5,10,0.6) 100%)",
                      borderColor: "rgba(244, 114, 182, 0.15)",
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-bold text-white text-base">
                          {formatDate(h.date)}
                        </span>
                      </div>
                      <p className="text-sm text-[#8888A8] pl-8">
                        เหตุผล: {h.reason}
                      </p>
                    </div>

                    <div className="sm:self-center self-start pl-8 sm:pl-0">
                      {getStatusBadge(h.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
