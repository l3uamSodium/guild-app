"use client";

import { useState } from "react";

interface QuestLog {
  id: string;
  date: string | Date;
  status: "DONE" | "ABSENT" | "LEAVE";
}

interface LeaveRequest {
  id: string;
  date: string | Date;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface QuestCalendarProps {
  monthYear: string; // Format: "YYYY-MM"
  questLogs: QuestLog[];
  leaveRequests: LeaveRequest[];
}

const MONTH_NAMES_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const WEEKDAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export default function QuestCalendar({
  monthYear,
  questLogs,
  leaveRequests,
}: QuestCalendarProps) {
  // Parse year and month
  const [yearStr, monthStr] = monthYear.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr); // 1-12

  // Get total days in month
  const totalDays = new Date(year, month, 0).getDate();

  // Get weekday of the 1st day (0 = Sunday, 1 = Monday, etc.)
  const startDayOffset = new Date(year, month - 1, 1).getDay();

  // Highlighted day for tooltip/details
  const [hoveredDay, setHoveredDay] = useState<{
    day: number;
    status: string;
    color: string;
    details: string;
  } | null>(null);

  // Generate calendar days
  const calendarDays = [];

  // Add padding offset days
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push({ padding: true, key: `pad-${i}` });
  }

  // Add actual days
  for (let day = 1; day <= totalDays; day++) {
    // Find matching quest log (UTC comparison to prevent timezone shifts)
    const matchLog = questLogs.find((log) => {
      const logDate = new Date(log.date);
      return (
        logDate.getUTCDate() === day &&
        logDate.getUTCMonth() + 1 === month &&
        logDate.getUTCFullYear() === year
      );
    });

    // Find matching approved leave request
    const matchLeave = leaveRequests.find((req) => {
      const reqDate = new Date(req.date);
      return (
        reqDate.getUTCDate() === day &&
        reqDate.getUTCMonth() + 1 === month &&
        reqDate.getUTCFullYear() === year &&
        req.status === "APPROVED"
      );
    });

    // Determine status & visual style
    let status: "DONE" | "ABSENT" | "LEAVE" | "NONE" = "NONE";
    let bgStyle = {
      background: "rgba(30, 30, 47, 0.4)",
      borderColor: "rgba(255, 255, 255, 0.05)",
      shadow: "none",
    };
    let label = "ไม่มีบันทึก / อนาคต";

    if (matchLeave) {
      status = "LEAVE";
      bgStyle = {
        background: "rgba(250, 204, 21, 0.25)",
        borderColor: "rgba(250, 204, 21, 0.55)",
        shadow: "0 0 10px rgba(250, 204, 21, 0.2)",
      };
      label = "พักกิจกรรม (อนุมัติแล้ว)";
    } else if (matchLog) {
      if (matchLog.status === "DONE") {
        status = "DONE";
        bgStyle = {
          background: "rgba(16, 185, 129, 0.25)",
          borderColor: "rgba(16, 185, 129, 0.55)",
          shadow: "0 0 10px rgba(16, 185, 129, 0.2)",
        };
        label = "เควสต์สำเร็จ";
      } else if (matchLog.status === "ABSENT") {
        status = "ABSENT";
        bgStyle = {
          background: "rgba(239, 68, 68, 0.25)",
          borderColor: "rgba(239, 68, 68, 0.55)",
          shadow: "0 0 10px rgba(239, 68, 68, 0.2)",
        };
        label = "ขาดเควสต์";
      } else if (matchLog.status === "LEAVE") {
        status = "LEAVE";
        bgStyle = {
          background: "rgba(250, 204, 21, 0.25)",
          borderColor: "rgba(250, 204, 21, 0.55)",
          shadow: "0 0 10px rgba(250, 204, 21, 0.2)",
        };
        label = "พักกิจกรรม";
      }
    }

    calendarDays.push({
      padding: false,
      day,
      status,
      bgStyle,
      label,
      key: `day-${day}`,
    });
  }

  const getStatusColorHex = (status: string) => {
    if (status === "DONE") return "#10B981";
    if (status === "ABSENT") return "#EF4444";
    if (status === "LEAVE") return "#FACC15";
    return "#64748B";
  };

  return (
    <div
      className="p-6 rounded-3xl border backdrop-blur-xl space-y-6 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(192,132,252,0.15)] h-full flex flex-col"
      style={{
        background: "linear-gradient(145deg, rgba(20,15,30,0.6) 0%, rgba(10,5,15,0.8) 100%)",
        borderColor: "rgba(192, 132, 252, 0.25)",
      }}
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3
          className="text-base font-bold text-slate-100"
          style={{ fontFamily: "var(--font-noto)" }}
        >
          ประวัติการทำเควสต์กิลด์ ประจำเดือน {MONTH_NAMES_TH[month - 1]} {year + 543}
        </h3>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block" />
            <span>สำเร็จ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40 inline-block" />
            <span>ขาดเควสต์</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40 inline-block" />
            <span>พักกิจกรรม</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800/40 border border-slate-700/30 inline-block" />
            <span>ไม่มีข้อมูล</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch flex-1">
        {/* The Grid */}
        <div className="md:col-span-2 flex flex-col justify-center">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
            {WEEKDAYS_TH.map((wd, i) => (
              <div
                key={wd}
                className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell) => {
              if (cell.padding) {
                return <div key={cell.key} className="aspect-square" />;
              }

              const isHovered = hoveredDay?.day === cell.day;

              return (
                <div
                  key={cell.key}
                  onMouseEnter={() =>
                    setHoveredDay({
                      day: cell.day!,
                      status: cell.status!,
                      color: getStatusColorHex(cell.status!),
                      details: cell.label!,
                    })
                  }
                  onMouseLeave={() => setHoveredDay(null)}
                  className="aspect-square rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center text-[13px] sm:text-sm font-mono font-semibold"
                  style={{
                    background: cell.bgStyle?.background,
                    borderColor: isHovered
                      ? getStatusColorHex(cell.status!)
                      : cell.bgStyle?.borderColor,
                    boxShadow: isHovered
                      ? cell.bgStyle?.shadow || "none"
                      : "none",
                    color:
                      cell.status === "NONE"
                        ? "#475569"
                        : getStatusColorHex(cell.status!),
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  {cell.day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hover Info Card */}
        <div
          className="p-5 rounded-2xl border flex flex-col justify-center h-full min-h-[160px] md:min-h-0 transition-all duration-300"
          style={{
            background: "linear-gradient(145deg, rgba(192,132,252,0.05) 0%, rgba(6,182,212,0.05) 100%)",
            borderColor: "rgba(192, 132, 252, 0.15)",
          }}
        >
          {hoveredDay ? (
            <div className="space-y-2" style={{ fontFamily: "var(--font-noto)" }}>
              <div className="text-xs text-slate-500">
                ข้อมูลวันที่ {hoveredDay.day} {MONTH_NAMES_TH[month - 1]}
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: hoveredDay.color }}
              >
                {hoveredDay.details}
              </div>
              <div className="text-xs text-slate-400">
                {hoveredDay.status === "DONE" && "ยอดเยี่ยม! คุณส่งผลเควสต์ครบถ้วนสำหรับวันนี้"}
                {hoveredDay.status === "ABSENT" && "ระวัง! มีการแจ้งว่าขาดทำเควสในวันนี้ กรุณาติดต่อแอดมินหากข้อมูลผิดพลาด"}
                {hoveredDay.status === "LEAVE" && "ได้รับอนุมัติพักกิจกรรมชั่วคราว คุณไม่จำเป็นต้องส่งเควสต์"}
                {hoveredDay.status === "NONE" && "ยังไม่มีการบันทึกสถานะ หรือเป็นวันพักผ่อนนอกกำหนดการ"}
              </div>
            </div>
          ) : (
            <div
              className="text-center text-slate-500 text-sm py-4"
              style={{ fontFamily: "var(--font-noto)" }}
            >
              วางเมาส์เหนือแต่ละวันเพื่อดูรายละเอียดบันทึกรายวัน
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
