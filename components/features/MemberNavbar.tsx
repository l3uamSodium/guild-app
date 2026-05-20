"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface MemberNavbarProps {
  avatarUrl?: string | null;
  inGameName?: string | null;
  role?: string | null;
}

export default function MemberNavbar({
  avatarUrl,
  inGameName,
  role,
}: MemberNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/dashboard", label: "แดชบอร์ด" },
    { href: "/leaderboard", label: "ตารางคะแนน" },
    { href: "/leave", label: "พักกิจกรรม" }, // เปลี่ยนจาก "ส่งใบลา" ตามคำแนะนำของผู้ใช้
    { href: "/shop", label: "ร้านค้ากิลด์" },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300"
      style={{
        background: "rgba(10, 10, 18, 0.75)",
        borderColor: "rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border transition-all duration-300 group-hover:scale-105"
            style={{
              background: "rgba(255, 45, 120, 0.1)",
              borderColor: "rgba(255, 45, 120, 0.3)",
              color: "#FF2D78",
              boxShadow: "0 0 10px rgba(255, 45, 120, 0.15)",
            }}
          >
            OZ
          </div>
          <span
            className="font-bold text-sm tracking-[0.2em] hidden sm:inline-block transition-colors duration-300 group-hover:text-slate-100"
            style={{
              fontFamily: "var(--font-cinzel)",
              background: "linear-gradient(135deg, #FFFFFF 30%, #FF6B9D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ONIZUKA
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 relative"
                style={{
                  fontFamily: "var(--font-noto)",
                  color: isActive ? "#FFFFFF" : "#8888A8",
                  background: isActive ? "rgba(255, 255, 255, 0.04)" : "transparent",
                  border: isActive ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid transparent",
                }}
              >
                {link.label}
                {isActive && (
                  <span
                    className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #C084FC, #F472B6)",
                      boxShadow: "0 0 6px #F472B6",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile / Logout */}
        <div className="flex items-center gap-3">
          {/* Admin panel link if GUILD_MASTER or VICE_MASTER */}
          {(role === "GUILD_MASTER" || role === "VICE_MASTER") && (
            <Link
              href="/members"
              className="hidden md:inline-flex px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
              style={{
                fontFamily: "var(--font-noto)",
                background: "rgba(192, 132, 252, 0.15)",
                borderColor: "rgba(192, 132, 252, 0.4)",
                color: "#C084FC",
              }}
            >
              ระบบแอดมิน
            </Link>
          )}

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase border relative"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.08)",
                color: "#94A3B8",
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={inGameName || "Avatar"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                inGameName?.substring(0, 2) || "ME"
              )}
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-medium border transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
              style={{
                fontFamily: "var(--font-noto)",
                background: "rgba(255,255,255,0.01)",
                borderColor: "rgba(255,255,255,0.05)",
                color: "#8888A8",
              }}
            >
              ออก
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
