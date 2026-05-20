"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function PendingPage() {
  const { data: session } = useSession();

  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#08080F" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 30% 40%, rgba(255,45,120,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(88,101,242,0.06) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center gap-6 px-10 py-12 rounded-3xl w-full"
        style={{
          maxWidth: "480px",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 0 40px rgba(0,0,0,0.5)",
        }}
      >
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
          <span className="text-2xl">⏳</span>
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold" style={{ color: "#E4E4F0" }}>
            รอการอนุมัติ
          </h1>
          <p style={{ color: "#A0A0B8", fontSize: "14px", lineHeight: "1.6" }}>
            ระบบได้รับข้อมูลของคุณแล้ว
            <br />
            กรุณารอ Guild Master อนุมัติสิทธิ์ภายใน 24 ชั่วโมง
          </p>
        </div>

        <div className="flex gap-3 w-full pt-4">
          <button
            onClick={() => window.open("https://discord.gg/your-guild-link", "_blank")}
            className="flex-1 py-3 rounded-xl font-medium transition-all hover:bg-white/10 text-white"
            style={{ background: "rgba(88,101,242,0.3)", border: "1px solid rgba(88,101,242,0.5)" }}
          >
            แจ้ง Admin ใน Discord
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-6 py-3 rounded-xl transition-all hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#A0A0B8" }}
          >
            ออก
          </button>
        </div>
      </div>
    </main>
  );
}
