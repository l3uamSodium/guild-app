"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { saveDailyQuestChecks, bulkAbsent } from "@/actions/questLog";

interface CheckedMember {
  id: string;
  inGameName: string;
  nickname: string;
  discordTag: string;
  avatar: string | null;
}

interface CheckedLeave {
  memberId: string;
  date: string;
}

interface CheckedLog {
  memberId: string;
  date: string;
  status: "DONE" | "ABSENT" | "LEAVE";
  proofImageUrl: string | null;
}

interface QuestCheckClientPageProps {
  members: CheckedMember[];
  approvedLeaves: CheckedLeave[];
  existingLogs: CheckedLog[];
  activeSeason: { id: string; monthYear: string } | null;
}

export default function QuestCheckClientPage({
  members,
  approvedLeaves,
  existingLogs,
  activeSeason,
}: QuestCheckClientPageProps) {
  // วันที่สำหรับสเตต
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // ดึงค่า leaves และ logs สำหรับวันที่เลือก
  const getLeavesForSelectedDate = () => {
    return approvedLeaves
      .filter((l) => l.date.split("T")[0] === selectedDate)
      .map((l) => l.memberId);
  };

  const getLogsForSelectedDate = () => {
    return existingLogs.filter((l) => l.date.split("T")[0] === selectedDate);
  };

  // อัปเดตรายการสมาชิกที่เช็คเมื่อเปลี่ยนวันที่ หรือโหลดหน้าแรก
  useEffect(() => {
    const leaveIds = getLeavesForSelectedDate();
    const dayLogs = getLogsForSelectedDate();

    if (dayLogs.length > 0) {
      // ถ้ามีประวัติที่เคยบันทึกไว้ในวันนั้น ให้โหลดค่าขึ้นมา
      const completed = dayLogs
        .filter((l) => l.status === "DONE")
        .map((l) => l.memberId);
      setCompletedIds(completed);
      
      // ดึงรูปหลักฐานที่เซฟไว้ (ถ้ามี)
      const firstLogWithImage = dayLogs.find((l) => l.proofImageUrl);
      if (firstLogWithImage?.proofImageUrl) {
        setScreenshotPreview(firstLogWithImage.proofImageUrl);
      } else {
        setScreenshotPreview(null);
        setScreenshotFile(null);
      }
    } else {
      // ถ้ายังไม่มีประวัติบันทึก ให้เซตเริ่มต้นเป็นว่าง (ยกเว้นคนพักกิจกรรม)
      setCompletedIds([]);
      setScreenshotPreview(null);
      setScreenshotFile(null);
    }
  }, [selectedDate]);

  // การจัดการไฟล์อัปโหลด
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showNotification("error", "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
      return;
    }
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  // การจัดการตารางเช็คลิสต์
  const toggleMemberChecked = (memberId: string) => {
    const leaveIds = getLeavesForSelectedDate();
    if (leaveIds.includes(memberId)) return; // คนพักกิจกรรมห้ามแก้ไข

    setCompletedIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAllEditable = () => {
    const leaveIds = getLeavesForSelectedDate();
    const editableMembers = members.filter((m) => !leaveIds.includes(m.id));
    setCompletedIds(editableMembers.map((m) => m.id));
  };

  const handleUnselectAllEditable = () => {
    setCompletedIds([]);
  };

  // บันทึกเควสผ่าน checklist
  const handleSaveChecks = () => {
    if (!activeSeason) {
      showNotification("error", "ไม่สามารถบันทึกได้เนื่องจากไม่มีซีซั่นเปิดอยู่");
      return;
    }

    startTransition(async () => {
      try {
        const result = await saveDailyQuestChecks(
          selectedDate,
          activeSeason.id,
          completedIds,
          screenshotPreview || undefined // ส่งรูป Base64 หรือ url เดิม
        );
        if (result.success) {
          showNotification("success", `บันทึกข้อมูลเควสรายวันประจำวันที่ ${formatDate(selectedDate)} สำเร็จ!`);
        }
      } catch (err: any) {
        showNotification("error", err.message || "เกิดข้อผิดพลาดในการบันทึก");
      }
    });
  };

  // บันทึกขาดส่งอัตโนมัติ (Bulk Absent)
  const handleBulkAbsent = () => {
    if (!activeSeason) {
      showNotification("error", "ไม่มีซีซั่นเปิดใช้งานอยู่");
      return;
    }

    if (
      confirm(
        `คุณต้องการทำรายการ "ปรับขาดส่งอัตโนมัติ" ใช่หรือไม่?\nสมาชิกทั้งหมดที่ไม่มีชื่อส่งเควสและไม่มีคำขอพักกิจกรรมจะถูกปรับเป็นขาดส่ง (Absent)`
      )
    ) {
      startTransition(async () => {
        try {
          const result = await bulkAbsent(selectedDate, activeSeason.id);
          showNotification(
            "success",
            `ปรับขาดส่งสำเร็จ! ปรับเป็น Absent: ${result.created} คน (ข้ามแล้ว: ${result.skipped} คน, พักกิจกรรม: ${result.excluded} คน)`
          );
          
          // โหลดข้อมูลเควสใหม่หลังทำ bulk
          window.location.reload();
        } catch (err: any) {
          showNotification("error", err.message || "เกิดข้อผิดพลาดในการรันคำสั่ง");
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
    return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(year, 10) + 543}`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const leaveIdsForDate = getLeavesForSelectedDate();
  const totalActiveCount = members.length;
  const leaveCount = leaveIdsForDate.length;
  const doneCount = completedIds.length;
  const absentCount = Math.max(0, totalActiveCount - leaveCount - doneCount);

  return (
    <main
      className="min-h-screen relative overflow-hidden px-4 py-12 md:px-8"
      style={{ background: "#08080F" }}
    >
      {/* Background gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 30% 40%, rgba(192,132,252,0.04) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(244,114,182,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(192,132,252,0.3) 1px, transparent 0)",
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
                background: "linear-gradient(135deg, #FFFFFF 20%, #C084FC 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              QUEST DAILY CHECK
            </h1>
            <p style={{ color: "#8888A8", fontSize: "14px" }}>
              แดชบอร์ดตรวจสอบเควสรายวันและอัปโหลดภาพหลักฐานการทำกิจกรรม
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
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            อนุมัติการพักกิจกรรม
          </a>
          <a
            href="/quest-check"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              fontFamily: "var(--font-noto)",
              background: "rgba(255,45,120,0.15)",
              border: "1px solid rgba(255,45,120,0.4)",
              color: "#FF6B9D",
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

        {/* Setup Check (if no season active) */}
        {!activeSeason ? (
          <div
            className="p-12 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center gap-6"
            style={{
              background: "rgba(239, 68, 68, 0.04)",
              borderColor: "rgba(239, 68, 68, 0.2)",
            }}
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">ไม่สามารถบันทึกเควสได้</h2>
              <p className="text-[#8888A8] text-sm max-w-md mx-auto">
                ยังไม่มีการเปิดกิลด์ซีซั่นในระบบ กรุณาแจ้ง Guild Master ให้ทำการเปิด Season ใหม่ เพื่อเริ่มต้นระบบเช็คเควส
              </p>
            </div>
            <Link
              href="/seasons"
              className="px-6 py-3 rounded-xl text-sm font-bold border transition duration-300 hover:brightness-110"
              style={{
                background: "rgba(192, 132, 252, 0.15)",
                borderColor: "rgba(192, 132, 252, 0.35)",
                color: "#C084FC",
              }}
            >
              ไปหน้าจัดการ Season
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Control Sidebar (Left Column) */}
            <div className="md:col-span-1 space-y-6">
              {/* Season status */}
              <div
                className="p-5 rounded-2xl border"
                style={{
                  background: "rgba(26,26,36,0.3)",
                  borderColor: "rgba(228,228,240,0.08)",
                }}
              >
                <p className="text-xs text-[#8888A8]">Active Season</p>
                <h3 className="text-base font-bold text-white">
                  {formatMonthYear(activeSeason.monthYear)}
                </h3>
              </div>

              {/* Date Selection */}
              <div
                className="p-6 rounded-3xl border space-y-4"
                style={{
                  background: "rgba(26,26,36,0.4)",
                  borderColor: "rgba(228,228,240,0.08)",
                }}
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8888A8] uppercase tracking-wider block">
                    เลือกวันที่ต้องการเช็ค
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    disabled={isPending}
                    className="w-full px-4 py-3 rounded-xl border border-border/60 bg-[#0F0F14]/60 text-white font-medium focus:border-primary focus:outline-none transition duration-300"
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                <div className="pt-2 text-xs text-[#8888A8]">
                  วันที่ถูกตั้งไว้เป็น: <span className="text-white font-semibold">{formatDate(selectedDate)}</span>
                </div>
              </div>

              {/* Drag-and-drop screenshot uploader */}
              <div
                className="p-6 rounded-3xl border space-y-4"
                style={{
                  background: "rgba(26,26,36,0.4)",
                  borderColor: "rgba(228,228,240,0.08)",
                }}
              >
                <label className="text-xs font-semibold text-[#8888A8] uppercase tracking-wider block">
                  รูปหลักฐานกิจกรรมประจำวัน
                </label>

                {screenshotPreview ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border group bg-surface">
                    <Image
                      src={screenshotPreview}
                      alt="Quest proof preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={handleRemoveScreenshot}
                        className="p-2.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:brightness-110 active:scale-95 transition"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center gap-2 cursor-pointer transition duration-300 relative group"
                    style={{
                      background: isDragOver ? "rgba(192, 132, 252, 0.05)" : "rgba(15,15,20,0.4)",
                      borderColor: isDragOver ? "#C084FC" : "rgba(228,228,240,0.15)",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <svg className="w-8 h-8 text-[#4B4B6A] group-hover:text-primary transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-xs text-[#8888A8]">
                      <span className="text-primary font-semibold">ลากรูปภาพมาวาง</span> หรือคลิกเพื่ออัปโหลด
                    </div>
                  </div>
                )}
              </div>

              {/* Attendance Quick Stats */}
              <div
                className="p-6 rounded-3xl border space-y-4"
                style={{
                  background: "rgba(26,26,36,0.4)",
                  borderColor: "rgba(228,228,240,0.08)",
                }}
              >
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  สรุปผลลัพธ์ที่จะบันทึก
                </h4>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[10px] text-emerald-400 uppercase">ผ่าน</p>
                    <p className="text-lg font-black text-white">{doneCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <p className="text-[10px] text-rose-400 uppercase">ขาดส่ง</p>
                    <p className="text-lg font-black text-white">{absentCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-[10px] text-amber-400 uppercase">พักกิจกรรม</p>
                    <p className="text-lg font-black text-white">{leaveCount}</p>
                  </div>
                </div>

                <div className="text-[11px] text-[#8888A8] text-center leading-relaxed">
                  จะลงบันทึกในฐานข้อมูลทั้งหมด <span className="text-white font-semibold">{totalActiveCount}</span> บัญชีสมาชิก
                </div>
              </div>

              {/* Main Submit & Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSaveChecks}
                  disabled={isPending}
                  className="w-full py-4 rounded-xl border text-sm font-bold tracking-wider transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: "rgba(192, 132, 252, 0.15)",
                    borderColor: "rgba(192, 132, 252, 0.35)",
                    color: "#C084FC",
                    boxShadow: "0 0 20px rgba(192,132,252,0.1)",
                  }}
                >
                  {isPending ? "กำลังบันทึก..." : "ยืนยันและบันทึกประวัติ"}
                </button>

                <button
                  onClick={handleBulkAbsent}
                  disabled={isPending}
                  className="w-full py-3.5 rounded-xl border text-xs font-bold tracking-wide transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(228,228,240,0.15)",
                    color: "#E4E4F0",
                  }}
                >
                  ปรับขาดส่งอัตโนมัติ (Bulk Absent)
                </button>
              </div>
            </div>

            {/* Members Checklist Table (Right Column) */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#8888A8] uppercase tracking-wider">
                  รายชื่อสมาชิกที่เข้าร่วมกิจกรรม
                </h3>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSelectAllEditable}
                    disabled={isPending}
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    เลือกทั้งหมด
                  </button>
                  <span className="text-[#4B4B6A] text-xs">|</span>
                  <button
                    onClick={handleUnselectAllEditable}
                    disabled={isPending}
                    className="text-xs text-[#8888A8] hover:underline cursor-pointer"
                  >
                    ล้างทั้งหมด
                  </button>
                </div>
              </div>

              {/* Checklist Container */}
              <div
                className="rounded-3xl border border-border overflow-hidden"
                style={{
                  background: "rgba(26,26,36,0.3)",
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/80 text-xs font-semibold text-[#8888A8] uppercase bg-surface/10">
                        <th className="px-6 py-4">สมาชิกกิลด์</th>
                        <th className="px-6 py-4">สถานะเช็คประจำวัน</th>
                        <th className="px-6 py-4 text-center w-24">ผ่านเควส</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-sm">
                      {members.map((m) => {
                        const isLeave = leaveIdsForDate.includes(m.id);
                        const isDone = completedIds.includes(m.id);
                        
                        return (
                          <tr
                            key={m.id}
                            onClick={() => !isLeave && toggleMemberChecked(m.id)}
                            className={`transition duration-300 ${
                              isLeave ? "opacity-60 bg-surface/5" : "hover:bg-surface/20 cursor-pointer"
                            }`}
                          >
                            {/* Member info */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-surface-2 border border-border flex items-center justify-center">
                                  {m.avatar ? (
                                    <Image
                                      src={m.avatar}
                                      alt={m.nickname}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <span className="text-[#8888A8] text-xs font-bold uppercase">
                                      {m.nickname[0]}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-white leading-tight">
                                    {m.inGameName}
                                  </p>
                                  <p className="text-xs text-[#8888A8]">
                                    {m.nickname} • @{m.discordTag}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Daily Status badge */}
                            <td className="px-6 py-4">
                              {isLeave ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-400">
                                  พักกิจกรรม (Leave)
                                </span>
                              ) : isDone ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                                  ผ่านเควส (Done)
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/25 text-rose-400">
                                  ขาดส่ง (Absent)
                                </span>
                              )}
                            </td>

                            {/* Checkbox indicator */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center">
                                {isLeave ? (
                                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={isDone}
                                    onChange={() => toggleMemberChecked(m.id)}
                                    disabled={isPending}
                                    className="w-5 h-5 rounded-lg border-2 border-border bg-[#0F0F14]/50 focus:ring-0 focus:outline-none accent-primary transition cursor-pointer"
                                    onClick={(e) => e.stopPropagation()} // block row toggle
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
