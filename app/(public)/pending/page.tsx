"use client";

import { useSession, signOut } from "next-auth/react";

export default function PendingPage() {
  const { data: session } = useSession();

  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
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
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)",
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

      <div
        className="relative z-10 flex flex-col items-center gap-8 px-10 py-12 rounded-3xl w-full"
        style={{
          maxWidth: "420px",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,45,120,0.15)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 0 100px rgba(255,45,120,0.06), 0 0 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-8 h-8 border-t border-l rounded-tl-3xl" style={{ borderColor: "rgba(255,45,120,0.4)" }} />
        <span className="absolute top-0 right-0 w-8 h-8 border-t border-r rounded-tr-3xl" style={{ borderColor: "rgba(255,45,120,0.4)" }} />
        <span className="absolute bottom-0 left-0 w-8 h-8 border-b border-l rounded-bl-3xl" style={{ borderColor: "rgba(255,45,120,0.4)" }} />
        <span className="absolute bottom-0 right-0 w-8 h-8 border-b border-r rounded-br-3xl" style={{ borderColor: "rgba(255,45,120,0.4)" }} />

        {/* Pulse Waiting Icon */}
        <div
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(255,45,120,0.05)",
            border: "1px solid rgba(255,45,120,0.2)",
            boxShadow: "0 0 40px rgba(255,45,120,0.15)",
          }}
        >
          <svg className="w-8 h-8 text-[#FF6B9D] animate-spin" style={{ animationDuration: '4s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Status Messages */}
        <div className="text-center space-y-2.5 w-full">
          <h1
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: "18px",
              fontWeight: 900,
              letterSpacing: "0.15em",
              background: "linear-gradient(135deg, #FFFFFF 20%, #FF6B9D 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textTransform: "uppercase",
            }}
          >
            PENDING APPROVAL
          </h1>
          <p style={{ fontFamily: "var(--font-noto)", color: "#3D3D5A", fontSize: "12px", marginTop: "6px" }}>
            ระบบได้รับข้อมูลของคุณเรียบร้อยแล้ว
          </p>
          <p
            style={{
              fontFamily: "var(--font-noto)",
              color: "#A0A0B8",
              fontSize: "13px",
              lineHeight: "1.6",
              paddingTop: "8px",
            }}
          >
            กรุณารอ Guild Master ดำเนินการอนุมัติสิทธิ์เข้าใช้งานภายใน 24 ชั่วโมง
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 pt-2">
          <button
            onClick={() => window.open("https://discord.gg/your-guild-link", "_blank")}
            className="group relative w-full flex items-center justify-center gap-3 px-8 py-[14px] rounded-xl overflow-hidden transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "rgba(88, 101, 242, 0.15)",
              border: "1px solid rgba(88, 101, 242, 0.35)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "rgba(88,101,242,0.08)" }}
            />
            <svg className="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.87-.64,1.72-1.32,2.53-2a75.46,75.46,0,0,0,73,0c.81.7,1.66,1.38,2.53,2a68.61,68.61,0,0,1-10.5,5,77.89,77.89,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,50.12,123.77,27.24,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.72,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96,53,91,65.69,84.69,65.69Z" />
            </svg>
            <span style={{ fontFamily: "var(--font-noto)", fontWeight: 500, fontSize: "14px", letterSpacing: "0.03em", color: "rgba(255,255,255,0.85)" }}>
              ติดต่อ Admin บน Discord
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
