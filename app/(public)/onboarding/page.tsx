"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function OnboardingPage() {
  const { data: session } = useSession();

  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#08080F" }}
    >
      {/* Background styling identical to landing page */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 30% 40%, rgba(255,45,120,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(88,101,242,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,45,120,0.6) 1px, transparent 0)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 flex flex-col items-center gap-8 px-10 py-12 rounded-3xl w-full"
        style={{
          maxWidth: "480px",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,45,120,0.15)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 0 100px rgba(255,45,120,0.06), 0 0 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
          style={{
            background: "rgba(255,45,120,0.1)",
            border: "1px solid rgba(255,45,120,0.3)",
          }}
        >
          {session?.user?.image ? (
            <Image src={session.user.image} alt="Profile" width={80} height={80} className="object-cover" />
          ) : (
            <span className="text-3xl">👤</span>
          )}
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold" style={{ color: "#FF6B9D" }}>
            ยินดีต้อนรับ, {session?.user?.name || "ผู้เล่นใหม่"}
          </h1>
          <p style={{ color: "#A0A0B8", fontSize: "14px", lineHeight: "1.6" }}>
            คุณล็อกอินผ่าน Discord สำเร็จแล้ว!
            <br />
            แต่คุณยังไม่ได้เป็นสมาชิกของกิลด์ ONIZUKA ในระบบ
          </p>
        </div>

        <div
          className="w-full p-4 rounded-xl text-center"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px dashed rgba(255,45,120,0.3)" }}
        >
          <p style={{ color: "#E4E4F0", fontSize: "14px" }}>
            กรุณาติดต่อ <span style={{ color: "#FF2D78", fontWeight: "bold" }}>Guild Master</span> เพื่อเพิ่มคุณเข้าสู่ระบบ
          </p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full py-3 rounded-xl transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#A0A0B8" }}
        >
          ออกจากระบบ
        </button>
      </div>
    </main>
  );
}
