"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function PendingPage() {
  const { data: session } = useSession();

  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8"
      style={{ background: "#08080F" }}
    >
      {/* Animated bg gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 30% 40%, rgba(255,45,120,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(88,101,242,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,45,120,0.6) 1px, transparent 0)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      {/* Horizontal lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,45,120,0.8) 60px, rgba(255,45,120,0.8) 61px)",
        }}
      />

      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] opacity-60"
        style={{ background: "linear-gradient(90deg, transparent, #FF2D78, transparent)" }}
      />

      {/* Distinct Wide Portal Container */}
      <div
        className="relative z-10 flex flex-col gap-8 p-8 md:p-10 rounded-3xl w-full"
        style={{
          maxWidth: "520px",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,45,120,0.15)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 20px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Subtle corner accents */}
        <span className="absolute top-0 left-0 w-6 h-6 border-t border-l rounded-tl-3xl" style={{ borderColor: "rgba(255,45,120,0.25)" }} />
        <span className="absolute top-0 right-0 w-6 h-6 border-t border-r rounded-tr-3xl" style={{ borderColor: "rgba(255,45,120,0.25)" }} />
        <span className="absolute bottom-0 left-0 w-6 h-6 border-b border-l rounded-bl-3xl" style={{ borderColor: "rgba(255,45,120,0.25)" }} />
        <span className="absolute bottom-0 right-0 w-6 h-6 border-b border-r rounded-br-3xl" style={{ borderColor: "rgba(255,45,120,0.25)" }} />

        {/* Portal Header */}
        <div className="space-y-2 border-b border-white/[0.04] pb-5">
          <span style={{ fontFamily: "var(--font-noto)", color: "#FF6B9D", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }} className="block">
            MEMBER PORTAL
          </span>
          <h1
            style={{
              fontFamily: "var(--font-noto)",
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "0.05em",
              color: "#FFFFFF",
              lineHeight: "1.3",
            }}
            className="block"
          >
            REGISTRATION STATUS
          </h1>
        </div>

        {/* Step-by-Step Progress Tracker */}
        <div className="relative pl-8 space-y-6">
          {/* Vertical Connective Line */}
          <div
            className="absolute left-[11px] top-3 bottom-3 w-[2px]"
            style={{
              background: "linear-gradient(180deg, #10B981 0%, #10B981 60%, rgba(255,45,120,0.2) 60%, rgba(255,45,120,0.2) 100%)",
            }}
          />

          {/* Step 1 */}
          <div className="relative flex flex-col gap-1">
            <span
              className="absolute -left-[31px] w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(16,185,129,0.15)",
                border: "1.5px solid #10B981",
              }}
            >
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div style={{ fontFamily: "var(--font-noto)", fontSize: "14px", fontWeight: 600, color: "#E4E4F0" }}>
              เชื่อมต่อบัญชี Discord สำเร็จ
            </div>
            <div style={{ fontFamily: "var(--font-noto)", fontSize: "12px", color: "#5B5B7A" }}>
              ลงทะเบียนผ่านระบบ NextAuth ด้วยบัญชีอย่างเป็นทางการ
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col gap-1">
            <span
              className="absolute -left-[31px] w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(16,185,129,0.15)",
                border: "1.5px solid #10B981",
              }}
            >
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div style={{ fontFamily: "var(--font-noto)", fontSize: "14px", fontWeight: 600, color: "#E4E4F0" }}>
              ส่งข้อมูลสมาชิกเรียบร้อย
            </div>
            <div style={{ fontFamily: "var(--font-noto)", fontSize: "12px", color: "#5B5B7A" }}>
              บันทึกรายชื่อในเกมและชื่อเล่นของคุณเข้าสู่ระบบฐานข้อมูลกิลด์
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col gap-1">
            <span
              className="absolute -left-[31px] w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,45,120,0.05)",
                border: "1.5px solid rgba(255,45,120,0.6)",
                boxShadow: "0 0 10px rgba(255,45,120,0.2)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#FF6B9D] animate-ping" />
            </span>
            <div style={{ fontFamily: "var(--font-noto)", fontSize: "14px", fontWeight: 600, color: "#FF6B9D" }}>
              อยู่ระหว่างรอแอดมินอนุมัติสิทธิ์ (Pending Review)
            </div>
            <div style={{ fontFamily: "var(--font-noto)", fontSize: "12px", color: "#A0A0B8", lineHeight: "1.5" }}>
              Guild Master หรือ Vice Master จะดำเนินการตรวจสอบและอนุมัติสิทธิ์เข้าใช้งานระบบสมาชิกภายใน 24 ชั่วโมง
            </div>
          </div>
        </div>

        {/* Discord user snapshot card */}
        {session?.user && (
          <div
            className="flex items-center gap-4 p-4 rounded-2xl border"
            style={{
              background: "rgba(0,0,0,0.25)",
              borderColor: "rgba(255,255,255,0.04)",
            }}
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
              {session.user.image ? (
                <Image src={session.user.image} alt="User Avatar" width={48} height={48} className="object-cover" />
              ) : (
                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span style={{ fontFamily: "var(--font-noto)", fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }} className="block truncate">
                {session.user.name}
              </span>
              <span style={{ fontFamily: "var(--font-noto)", fontSize: "11px", color: "#5B5B7A" }} className="block">
                Discord Account Connected
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full border-t border-white/[0.04] pt-5">
          <button
            onClick={() => window.open("https://discord.gg/your-guild-link", "_blank")}
            className="group relative w-full flex items-center justify-center gap-3 px-8 py-[14px] rounded-xl overflow-hidden transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "rgba(88, 101, 242, 0.12)",
              border: "1px solid rgba(88, 101, 242, 0.3)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "rgba(88,101,242,0.08)" }}
            />
            <svg className="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.87-.64,1.72-1.32,2.53-2a75.46,75.46,0,0,0,73,0c.81.7,1.66,1.38,2.53,2a68.61,68.61,0,0,1-10.5,5,77.89,77.89,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,50.12,123.77,27.24,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.72,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96,53,91,65.69,84.69,65.69Z" />
            </svg>
            <span style={{ fontFamily: "var(--font-noto)", fontWeight: 500, fontSize: "14px", letterSpacing: "0.03em", color: "rgba(255,255,255,0.8)" }}>
              เข้า Discord กิลด์เพื่อแจ้งผู้ดูแล
            </span>
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full py-3 rounded-xl transition-all hover:bg-white/5"
            style={{
              fontFamily: "var(--font-noto)",
              border: "1px solid rgba(255,255,255,0.05)",
              color: "#5B5B7A",
              fontSize: "13px",
            }}
          >
            ย้อนกลับ (ออกจากระบบ)
          </button>
        </div>
      </div>
    </main>
  );
}
