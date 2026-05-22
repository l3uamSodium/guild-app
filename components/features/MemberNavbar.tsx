"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface MemberNavbarProps {
  avatarUrl?: string | null;
  inGameName?: string | null;
  role?: string | null;
  points?: number;
  maxPoints?: number;
}

export default function MemberNavbar({
  avatarUrl,
  inGameName,
  role,
  points = 0,
  maxPoints = 50000,
}: MemberNavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "แดชบอร์ด" },
    { href: "/leaderboard", label: "ตารางคะแนน" },
    { href: "/leave", label: "พักกิจกรรม" },
    { href: "/shop", label: "ร้านค้ากิลด์" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 pointer-events-none flex justify-center">
      <header
        className="pointer-events-auto w-full max-w-5xl rounded-full border backdrop-blur-xl transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        style={{
          background: "linear-gradient(180deg, rgba(20, 15, 30, 0.7) 0%, rgba(10, 5, 15, 0.9) 100%)",
          borderColor: "rgba(192, 132, 252, 0.25)",
        }}
      >
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo / Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-[0_0_16px_rgba(192,132,252,0.2)]"
              style={{
                fontFamily: "var(--font-cinzel)",
                background: "rgba(192, 132, 252, 0.1)",
                borderColor: "rgba(192, 132, 252, 0.4)",
                color: "#E879F9",
              }}
            >
              OZ
            </div>
            <span
              className="font-black text-sm tracking-[0.25em] hidden md:inline-block"
              style={{
                fontFamily: "var(--font-cinzel)",
                background: "linear-gradient(135deg, #FFFFFF 20%, #E879F9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ONIZUKA
            </span>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 rounded-full text-xs font-bold transition-all duration-300"
                  style={{
                    fontFamily: "var(--font-noto)",
                    color: isActive ? "#FFFFFF" : "#8888A8",
                    background: isActive ? "rgba(192, 132, 252, 0.15)" : "transparent",
                    textShadow: isActive ? "0 0 12px rgba(192,132,252,0.5)" : "none",
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full border"
                      style={{
                        borderColor: "rgba(192, 132, 252, 0.4)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Points Display */}
            <div 
              className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 hover:shadow-[0_0_16px_rgba(6,182,212,0.25)] hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(90deg, rgba(6,182,212,0.1), rgba(6,182,212,0.02))",
                borderColor: "rgba(6, 182, 212, 0.3)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-cyan-400 drop-shadow-md">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <div className="font-mono text-xs tracking-wide">
                <span className="font-bold text-cyan-300 drop-shadow-md">{points.toLocaleString()}</span>
                <span className="text-cyan-500/50 mx-1.5">/</span>
                <span className="text-cyan-400/80 font-medium">{maxPoints.toLocaleString()}</span>
              </div>
            </div>

            {(role === "GUILD_MASTER" || role === "VICE_MASTER") && (
              <Link
                href="/members"
                className="hidden md:inline-flex px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 hover:scale-105 hover:shadow-[0_0_16px_rgba(255,45,120,0.3)]"
                style={{
                  fontFamily: "var(--font-noto)",
                  background: "linear-gradient(135deg, rgba(255,45,120,0.15) 0%, rgba(192,132,252,0.15) 100%)",
                  borderColor: "rgba(255, 45, 120, 0.4)",
                  color: "#FF9EBB",
                }}
              >
                Admin
              </Link>
            )}

            <div className="w-px h-6 bg-white/10 hidden sm:block mx-1" />

            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full overflow-hidden border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold uppercase transition-transform duration-300 hover:scale-110 hover:border-purple-400"
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#E879F9",
                boxShadow: "0 0 10px rgba(192,132,252,0.2)",
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={inGameName || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                inGameName?.substring(0, 2) || "ME"
              )}
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-red-500/20 hover:text-red-400 text-slate-400"
              title="ออกจากระบบ"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
