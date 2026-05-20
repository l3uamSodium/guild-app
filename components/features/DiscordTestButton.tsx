"use client";

import { useState } from "react";
import { sendTestNotificationAction } from "@/app/actions/test-discord";

export default function DiscordTestButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  const handleTest = async () => {
    setLoading(true);
    setStatus({ type: "idle" });

    try {
      const res = await sendTestNotificationAction();
      if (res.success) {
        setStatus({
          type: "success",
          message: "ระบบส่งข้อความทดสอบเข้า Discord DM ของคุณสำเร็จแล้ว! กรุณาเปิดแอป Discord เพื่อตรวจสอบ",
        });
      } else {
        setStatus({
          type: "error",
          message: res.error || "เกิดข้อผิดพลาดไม่ทราบสาเหตุในการส่งข้อความ",
        });
      }
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err.message || "ระบบเชื่อมต่อขัดข้อง กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-6 rounded-2xl border transition-all duration-300"
      style={{
        background: "rgba(10, 10, 18, 0.4)",
        borderColor:
          status.type === "success"
            ? "rgba(16, 185, 129, 0.3)"
            : status.type === "error"
            ? "rgba(239, 68, 68, 0.3)"
            : "rgba(255, 45, 120, 0.15)",
        boxShadow:
          status.type === "success"
            ? "0 0 15px rgba(16, 185, 129, 0.05)"
            : status.type === "error"
            ? "0 0 15px rgba(239, 68, 68, 0.05)"
            : "none",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3
            className="text-sm font-bold text-slate-200"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            ทดสอบการเชื่อมต่อบอตแจ้งเตือน (Discord DM Test)
          </h3>
          <p
            className="text-xs text-slate-400"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            กดปุ่มเพื่อทดสอบส่งข้อความแจ้งเตือนส่วนตัวเข้าแอป Discord เพื่อทดสอบความถูกต้อง
          </p>
        </div>

        <button
          onClick={handleTest}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-50 min-w-[150px] relative overflow-hidden"
          style={{
            background: loading
              ? "rgba(255, 255, 255, 0.05)"
              : "linear-gradient(135deg, #FF2D78, #8B5CF6)",
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            fontFamily: "var(--font-noto)",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-3 w-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              กำลังส่งข้อความ...
            </span>
          ) : (
            "ส่งข้อความทดสอบ"
          )}
        </button>
      </div>

      {status.type !== "idle" && (
        <div
          className="mt-4 p-3 rounded-xl text-xs border animate-fadeIn"
          style={{
            background:
              status.type === "success"
                ? "rgba(16, 185, 129, 0.05)"
                : "rgba(239, 68, 68, 0.05)",
            borderColor:
              status.type === "success"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            color: status.type === "success" ? "#34D399" : "#F87171",
            fontFamily: "var(--font-noto)",
          }}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
