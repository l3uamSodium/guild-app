"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

function LoginContent() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {error && (
        <div
          className="w-full px-4 py-3 rounded-xl text-sm text-center"
          style={{
            background: "rgba(255,45,120,0.1)",
            border: "1px solid rgba(255,45,120,0.3)",
            color: "#FF6B9D",
          }}
        >
          เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง
        </div>
      )}

      <button
        id="btn-discord-login"
        onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
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
        <svg width="20" height="20" viewBox="0 0 71 55" fill="#7289DA">
          <path d="M60.105 4.898A58.55 58.55 0 0 0 45.865.901a40.28 40.28 0 0 0-1.8 3.696 54.165 54.165 0 0 0-16.23 0A40.606 40.606 0 0 0 26.032.9a58.392 58.392 0 0 0-14.24 3.998C1.704 17.467-1.04 30.698.325 43.747a58.747 58.747 0 0 0 17.93 9.076 44.48 44.48 0 0 0 3.855-6.27 38.342 38.342 0 0 1-6.072-2.92c.51-.372 1.009-.757 1.49-1.14 11.703 5.39 24.38 5.39 35.943 0 .483.395.981.78 1.49 1.14a38.23 38.23 0 0 1-6.08 2.923 44.3 44.3 0 0 0 3.854 6.27 58.613 58.613 0 0 0 17.939-9.076c1.692-17.67-2.876-30.755-12.063-43.849v.003ZM23.725 35.949c-3.497 0-6.38-3.21-6.38-7.14 0-3.93 2.819-7.14 6.38-7.14 3.56 0 6.443 3.21 6.38 7.14.006 3.93-2.82 7.14-6.38 7.14Zm23.55 0c-3.498 0-6.381-3.21-6.381-7.14 0-3.93 2.82-7.14 6.38-7.14 3.562 0 6.444 3.21 6.381 7.14 0 3.93-2.82 7.14-6.38 7.14Z" />
        </svg>
        <span style={{ fontFamily: "var(--font-noto)", fontWeight: 500, fontSize: "15px", letterSpacing: "0.03em", color: "rgba(255,255,255,0.85)" }}>
          เข้าสู่ระบบด้วย Discord
        </span>
      </button>

      <p style={{ fontFamily: "var(--font-noto)", color: "#2D2D42", fontSize: "12px", letterSpacing: "0.03em" }}>
        เฉพาะสมาชิก ONIZUKA เท่านั้น
      </p>
    </div>
  );
}

export default function LandingPage() {
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

      {/* Card */}
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

        {/* Logo */}
        <div className="flex flex-col items-center gap-5">
          <div
            className="relative w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              background: "rgba(255,45,120,0.05)",
              border: "1px solid rgba(255,45,120,0.2)",
              boxShadow: "0 0 40px rgba(255,45,120,0.15)",
            }}
          >
            {/* ถ้ามี logo.png ให้แสดง ถ้าไม่มีแสดง fallback text */}
            <Image
              src="/logo.jpg"
              alt="ONIZUKA Logo"
              width={112}
              height={112}
              className="object-cover w-full h-full"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>

          <div className="text-center space-y-1">
            <h1
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: "22px",
                fontWeight: 900,
                letterSpacing: "0.2em",
                background: "linear-gradient(135deg, #FFFFFF 20%, #FF6B9D 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
                textShadow: "none",
              }}
            >
              ONIZUKA
            </h1>
            <p style={{ color: "#FF2D78", fontSize: "11px", letterSpacing: "0.2em" }}>
              — 鬼　塚 —
            </p>
            <p style={{ color: "#3D3D5A", fontSize: "12px", marginTop: "6px" }}>
              Guild Management System
            </p>
          </div>
        </div>

        {/* Login */}
        <Suspense fallback={<div className="h-14 w-full rounded-2xl" style={{ background: "rgba(255,255,255,0.03)" }} />}>
          <LoginContent />
        </Suspense>
      </div>
    </main>
  );
}
