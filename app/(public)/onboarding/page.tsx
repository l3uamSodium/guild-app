"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitOnboarding } from "./actions";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [state, action, isPending] = useActionState(submitOnboarding, null);

  useEffect(() => {
    if (state?.success) {
      update().then(() => {
        router.push("/pending");
      });
    }
  }, [state, update, router]);

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

        {/* Profile */}
        <div className="flex flex-col items-center gap-5">
          <div
            className="relative w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              background: "rgba(255,45,120,0.05)",
              border: "1px solid rgba(255,45,120,0.2)",
              boxShadow: "0 0 40px rgba(255,45,120,0.15)",
            }}
          >
            {session?.user?.image ? (
              <Image src={session.user.image} alt="Profile" width={80} height={80} className="object-cover w-full h-full" />
            ) : (
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            )}
          </div>

          <div className="text-center space-y-1 w-full">
            <h1
              style={{
                fontFamily: "var(--font-noto)",
                fontSize: "16px",
                fontWeight: 800,
                letterSpacing: "0.05em",
                background: "linear-gradient(135deg, #FFFFFF 20%, #FF6B9D 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
              }}
            >
              {session?.user?.name || "PLAYER"}
            </h1>
            <p style={{ fontFamily: "var(--font-noto)", color: "#3D3D5A", fontSize: "12px", marginTop: "6px" }}>
              กรุณายืนยันข้อมูลสมาชิก
            </p>
          </div>
        </div>

        <form action={action} className="w-full space-y-5">
          <div className="space-y-2">
            <label htmlFor="inGameName" style={{ fontFamily: "var(--font-noto)", color: "#A0A0B8", fontSize: "12px", letterSpacing: "0.03em" }}>
              ชื่อในเกม (In-Game Name) <span style={{ color: "#FF2D78" }}>*</span>
            </label>
            <input
              type="text"
              name="inGameName"
              id="inGameName"
              required
              className="w-full rounded-xl px-4 py-3 text-white outline-none transition-all"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "var(--font-noto)",
                fontSize: "14px",
              }}
              placeholder="เช่น: DarkSlayer99"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="nickname" style={{ fontFamily: "var(--font-noto)", color: "#A0A0B8", fontSize: "12px", letterSpacing: "0.03em" }}>
              ชื่อเล่น (Nickname) <span style={{ color: "#FF2D78" }}>*</span>
            </label>
            <input
              type="text"
              name="nickname"
              id="nickname"
              required
              className="w-full rounded-xl px-4 py-3 text-white outline-none transition-all"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "var(--font-noto)",
                fontSize: "14px",
              }}
              placeholder="เช่น: นนท์"
            />
          </div>

          {state?.error && (
            <div
              className="w-full px-4 py-3 rounded-xl text-sm text-center"
              style={{
                background: "rgba(255,45,120,0.1)",
                border: "1px solid rgba(255,45,120,0.3)",
                color: "#FF6B9D",
                fontFamily: "var(--font-noto)",
              }}
            >
              {state.error}
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex items-center justify-center gap-3 px-8 py-[14px] rounded-xl overflow-hidden transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              style={{
                background: "rgba(255, 45, 120, 0.15)",
                border: "1px solid rgba(255, 45, 120, 0.35)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "rgba(255,45,120,0.08)" }}
              />
              <span style={{ fontFamily: "var(--font-noto)", fontWeight: 500, fontSize: "14px", letterSpacing: "0.03em", color: "rgba(255,255,255,0.85)" }}>
                {isPending ? "กำลังบันทึก..." : "ยืนยันข้อมูลสมาชิก"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full py-3 rounded-xl transition-all hover:bg-white/5"
              style={{ 
                fontFamily: "var(--font-noto)", 
                border: "1px solid rgba(255,255,255,0.05)", 
                color: "#5B5B7A", 
                fontSize: "13px" 
              }}
            >
              ย้อนกลับ (ออกจากระบบ)
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
