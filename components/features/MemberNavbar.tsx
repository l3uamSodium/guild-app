"use client";

import { usePathname } from "next/navigation";
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

  const navLinks = [
    { href: "/dashboard", label: "แดชบอร์ด" },
    { href: "/leaderboard", label: "ตารางคะแนน" },
    { href: "/leave", label: "พักกิจกรรม" },
    { href: "/shop", label: "ร้านค้ากิลด์" },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-300"
      style={{
        background: "rgba(8, 8, 15, 0.8)",
        borderColor: "rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,45,120,0.5) 30%, rgba(192,132,252,0.4) 70%, transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_16px_rgba(255,45,120,0.3)]"
            style={{
              fontFamily: "var(--font-cinzel)",
              background: "rgba(255, 45, 120, 0.08)",
              borderColor: "rgba(255, 45, 120, 0.25)",
              color: "#FF2D78",
            }}
          >
            OZ
          </div>
          <span
            className="font-black text-sm tracking-[0.25em] hidden sm:inline-block"
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
        <nav className="flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  fontFamily: "var(--font-noto)",
                  color: isActive ? "#FFFFFF" : "#5B5B7A",
                  background: isActive ? "rgba(255, 255, 255, 0.05)" : "transparent",
                }}
              >
                {link.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #FF2D78, #C084FC)",
                      boxShadow: "0 0 8px rgba(255,45,120,0.6)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {(role === "GUILD_MASTER" || role === "VICE_MASTER") && (
            <Link
              href="/members"
              className="hidden md:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 hover:brightness-110"
              style={{
                fontFamily: "var(--font-noto)",
                background: "rgba(192, 132, 252, 0.08)",
                borderColor: "rgba(192, 132, 252, 0.25)",
                color: "#C084FC",
              }}
            >
              Admin
            </Link>
          )}

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full overflow-hidden border flex-shrink-0 flex items-center justify-center text-xs font-bold uppercase"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "#8888A8",
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
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400/80"
            style={{
              fontFamily: "var(--font-noto)",
              background: "transparent",
              borderColor: "rgba(255,255,255,0.06)",
              color: "#4B4B6A",
            }}
          >
            ออก
          </button>
        </div>
      </div>
    </header>
  );
}
