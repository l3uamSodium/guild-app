"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { reviewLeaveRequest } from "@/app/actions/leave";

interface LeaveMember {
  id: string;
  inGameName: string;
  nickname: string;
  discordTag: string;
  avatar: string | null;
}

interface LeaveSeason {
  id: string;
  monthYear: string;
}

interface LeaveRequestItem {
  id: string;
  date: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt: string | null;
  member: LeaveMember;
  season: LeaveSeason;
}

interface AdminLeaveClientPageProps {
  initialPending: LeaveRequestItem[];
  initialReviewed: LeaveRequestItem[];
}

export default function AdminLeaveClientPage({
  initialPending,
  initialReviewed,
}: AdminLeaveClientPageProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "reviewed">("pending");
  const [pendingList, setPendingList] = useState<LeaveRequestItem[]>(initialPending);
  const [reviewedList, setReviewedList] = useState<LeaveRequestItem[]>(initialReviewed);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleReview = async (id: string, name: string, status: "APPROVED" | "REJECTED") => {
    const actionText = status === "APPROVED" ? "อนุมัติ" : "ปฏิเสธ";
    if (confirm(`คุณต้องการ ${actionText} คำขอพักกิจกรรมของ "${name}" ใช่หรือไม่?`)) {
      startTransition(async () => {
        try {
          const result = await reviewLeaveRequest(id, status);
          if (result.success && result.leave) {
            showNotification("success", `ทำการ ${actionText} คำขอพักกิจกรรมของ ${name} เรียบร้อยแล้ว!`);
            
            // Move item from pending to reviewed
            const itemToMove = pendingList.find((l) => l.id === id);
            if (itemToMove) {
              const updatedItem: LeaveRequestItem = {
                ...itemToMove,
                status,
                reviewedAt: new Date().toISOString(),
              };
              setPendingList((prev) => prev.filter((l) => l.id !== id));
              setReviewedList((prev) => [updatedItem, ...prev]);
            }
          }
        } catch (err: any) {
          showNotification("error", err.message || "เกิดข้อผิดพลาดในการตรวจสอบคำขอพักกิจกรรม");
        }
      });
    }
  };

  const currentList = activeTab === "pending" ? pendingList : reviewedList;
  const filteredList = currentList.filter((l) => {
    // 1. Text match
    const textMatch =
      l.member.inGameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.member.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.member.discordTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Date match (if selected)
    if (!filterDate) return textMatch;
    
    const leaveDateStr = l.date.split("T")[0]; // YYYY-MM-DD
    return textMatch && leaveDateStr === filterDate;
  });

  const formatMonthYear = (myStr: string) => {
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

  return (
    <main
      className="min-h-screen relative overflow-hidden px-4 py-12 md:px-8"
      style={{ background: "#08080F" }}
    >
      {/* Background gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 30% 40%, rgba(244,114,182,0.04) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(192,132,252,0.03) 0%, transparent 70%)",
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
                background: "linear-gradient(135deg, #FFFFFF 20%, #F472B6 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              REVIEW ACTIVITY REST
            </h1>
            <p style={{ color: "#8888A8", fontSize: "14px" }}>
              อนุมัติหรือปฏิเสธคำขอพักกิจกรรมของสมาชิก เพื่อยกเว้นระบบขาดการทำเควสกิลด์
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
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            จัดการซีซัน
          </a>
          <a
            href="/admin/leave"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              fontFamily: "var(--font-noto)",
              background: "rgba(255,45,120,0.15)",
              border: "1px solid rgba(255,45,120,0.4)",
              color: "#FF6B9D",
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

        {/* Tabs & Search controls */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between border-b border-border pb-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("pending")}
              className="pb-3 text-sm font-semibold relative transition-colors duration-300 cursor-pointer"
              style={{
                color: activeTab === "pending" ? "#F472B6" : "#8888A8",
              }}
            >
              คำขอที่รอพิจารณา ({pendingList.length})
              {activeTab === "pending" && (
                <span
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-accent rounded-full shadow-[0_0_8px_#F472B6]"
                  style={{ background: "#F472B6" }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviewed")}
              className="pb-3 text-sm font-semibold relative transition-colors duration-300 cursor-pointer"
              style={{
                color: activeTab === "reviewed" ? "#F472B6" : "#8888A8",
              }}
            >
              ประวัติการพิจารณา ({reviewedList.length})
              {activeTab === "reviewed" && (
                <span
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-accent rounded-full shadow-[0_0_8px_#F472B6]"
                  style={{ background: "#F472B6" }}
                />
              )}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="ค้นหาสมาชิก, เหตุผล..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-[#0F0F14]/50 text-sm focus:border-accent focus:outline-none transition duration-300"
              />
              <svg className="w-4 h-4 text-[#4B4B6A] absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Date filter */}
            <div className="relative w-full sm:w-auto">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-border bg-[#0F0F14]/50 text-sm focus:border-accent focus:outline-none transition duration-300"
                style={{ colorScheme: "dark" }}
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-[#8888A8] hover:text-white"
                >
                  ล้างค่า
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table / List */}
        <div
          className="rounded-3xl border border-border overflow-hidden backdrop-filter backdrop-blur-xl"
          style={{ background: "rgba(26,26,36,0.3)" }}
        >
          {filteredList.length === 0 ? (
            <div className="p-16 text-center text-[#8888A8] space-y-2">
              <svg className="w-12 h-12 mx-auto text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="font-medium text-sm">ไม่พบคำขอพักกิจกรรมที่สอดคล้องตามตัวกรอง</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/80 text-xs font-semibold text-[#8888A8] uppercase tracking-wider bg-surface/10">
                    <th className="px-6 py-4">สมาชิกกิลด์</th>
                    <th className="px-6 py-4">วันที่ขอพักกิจกรรม</th>
                    <th className="px-6 py-4">เหตุผลการพักกิจกรรม</th>
                    <th className="px-6 py-4">รอบ Season</th>
                    {activeTab === "reviewed" && <th className="px-6 py-4">ผลการพิจารณา</th>}
                    {activeTab === "pending" && <th className="px-6 py-4 text-right">การจัดการ</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {filteredList.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-surface/20 transition duration-300"
                    >
                      {/* Member Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-surface-2 border border-border flex items-center justify-center">
                            {item.member.avatar ? (
                              <Image
                                src={item.member.avatar}
                                alt={item.member.nickname}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-[#8888A8] text-xs font-bold uppercase">
                                {item.member.nickname[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">
                              {item.member.inGameName}
                            </p>
                            <p className="text-xs text-[#8888A8]">
                              {item.member.nickname} • @{item.member.discordTag}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>

                      {/* Reason */}
                      <td className="px-6 py-4 text-[#8888A8] max-w-xs break-words">
                        {item.reason}
                      </td>

                      {/* Season */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium border border-border bg-surface/30 text-[#E4E4F0]">
                          {formatMonthYear(item.season.monthYear)}
                        </span>
                      </td>

                      {/* Review Status or Action */}
                      {activeTab === "reviewed" ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.status === "APPROVED" ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                              อนุมัติเรียบร้อย
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/25 text-rose-400">
                              ปฏิเสธคำขอ
                            </span>
                          )}
                        </td>
                      ) : (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleReview(item.id, item.member.inGameName, "APPROVED")}
                              disabled={isPending}
                              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wide border transition-all duration-300 hover:brightness-110 active:scale-[0.97] cursor-pointer"
                              style={{
                                background: "rgba(16, 185, 129, 0.12)",
                                borderColor: "rgba(16, 185, 129, 0.35)",
                                color: "#4ADE80",
                              }}
                            >
                              อนุมัติ
                            </button>
                            <button
                              onClick={() => handleReview(item.id, item.member.inGameName, "REJECTED")}
                              disabled={isPending}
                              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wide border transition-all duration-300 hover:brightness-110 active:scale-[0.97] cursor-pointer"
                              style={{
                                background: "rgba(239, 68, 68, 0.12)",
                                borderColor: "rgba(239, 68, 68, 0.35)",
                                color: "#F87171",
                              }}
                            >
                              ปฏิเสธ
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
