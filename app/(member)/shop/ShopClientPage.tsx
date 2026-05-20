"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MemberNavbar from "@/components/features/MemberNavbar";
import { redeemItem } from "./actions";

interface ShopItemData {
  id: string;
  name: string;
  description: string | null;
  type: "NORMAL" | "LUCKY_DRAW";
  price: number;
  stock: number;
  imageUrl: string | null;
  drawClosesAt: string | null;
  drawWinnerId: string | null;
}

interface ShopClientPageProps {
  shopItems: ShopItemData[];
  pointsBalance: number;
  earnedPoints: number;
  totalRedeemed: number;
  memberInfo: {
    inGameName: string;
    role: string;
    avatarUrl: string | null;
  };
}

export default function ShopClientPage({
  shopItems,
  pointsBalance,
  earnedPoints,
  totalRedeemed,
  memberInfo,
}: ShopClientPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ALL" | "NORMAL" | "LUCKY_DRAW">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Loading state for redemptions
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  
  // Custom toast notification state
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleRedeem = async (item: ShopItemData) => {
    if (confirm(`คุณต้องการใช้แต้มสะสมจำนวน ${item.price} Pts เพื่อแลก "${item.name}" ใช่หรือไม่?`)) {
      setRedeemingId(item.id);
      try {
        const res = await redeemItem(item.id);
        if (res.success) {
          showNotification(
            "success",
            item.type === "LUCKY_DRAW"
              ? "เข้าร่วมกิจกรรมลุ้นรับโชคสำเร็จ! แต้มของท่านถูกหักเรียบร้อย"
              : "แลกรางวัลสำเร็จ! สามารถดูสถานะการจัดส่งได้ที่หน้าแดชบอร์ด"
          );
          router.refresh();
        } else {
          let errMsg = "เกิดข้อผิดพลาดในการแลกรางวัล";
          if (res.error === "OUT_OF_STOCK") errMsg = "สินค้าหมดชั่วคราว!";
          if (res.error === "INSUFFICIENT_POINTS") errMsg = "แต้มกิลด์สะสมของคุณไม่เพียงพอ!";
          if (res.error === "DRAW_CLOSED") errMsg = "กิจกรรมจับรางวัลนี้ปิดรับสิทธิ์แล้ว!";
          showNotification("error", errMsg);
        }
      } catch (err) {
        showNotification("error", "เกิดข้อผิดพลาดจากเครือข่าย กรุณาลองใหม่อีกครั้ง");
      } finally {
        setRedeemingId(null);
      }
    }
  };

  // Filter items
  const filteredItems = shopItems.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.type === activeTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#08080F" }}>
      {/* Shared Navbar */}
      <MemberNavbar
        avatarUrl={memberInfo.avatarUrl}
        inGameName={memberInfo.inGameName}
        role={memberInfo.role}
      />

      {/* Floating Cyberpunk Notification Toast */}
      {notification && (
        <div
          className="fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 animate-bounce"
          style={{
            background: "rgba(10, 10, 18, 0.95)",
            borderColor: notification.type === "success" ? "#10B981" : "#EF4444",
            boxShadow:
              notification.type === "success"
                ? "0 0 20px rgba(16, 185, 129, 0.2)"
                : "0 0 20px rgba(239, 68, 68, 0.2)",
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: notification.type === "success" ? "#10B981" : "#EF4444",
            }}
          />
          <p
            className="text-sm font-semibold text-slate-100"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            {notification.message}
          </p>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-8 relative z-10">
        {/* Background Gradients */}
        <div
          className="absolute top-1/3 right-1/3 w-[300px] h-[300px] opacity-[0.03] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(#C084FC, transparent 70%)" }}
        />

        {/* Shop Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: "28px",
                fontWeight: 900,
                letterSpacing: "0.15em",
                background: "linear-gradient(135deg, #FFFFFF 20%, #C084FC 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
              }}
            >
              GUILD SHOP
            </h1>
            <p style={{ fontFamily: "var(--font-noto)", color: "#5B5B7A", fontSize: "14px", marginTop: "4px" }}>
              ใช้แต้มกิลด์วอร์ของคุณในการแลกของรางวัลพรีเมียม หรือซื้อสิทธิ์ลุ้นรับรางวัลใหญ่ประจำซีซัน
            </p>
          </div>

          {/* User Points Card */}
          <div
            className="px-6 py-4 rounded-2xl border backdrop-blur-md flex items-center gap-6"
            style={{
              background: "rgba(10, 10, 18, 0.6)",
              borderColor: "rgba(192, 132, 252, 0.2)",
              boxShadow: "0 0 20px rgba(192, 132, 252, 0.05)",
            }}
          >
            <div>
              <div style={{ color: "#5B5B7A", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>แต้มกิลด์คงเหลือ</div>
              <div className="text-2xl font-mono font-bold text-cyan-400 mt-0.5 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                {pointsBalance.toLocaleString()}{" "}
                <span className="text-xs text-slate-500 font-normal">Pts</span>
              </div>
            </div>

            <div className="w-[1px] h-10 bg-white/[0.06]" />

            <div>
              <div style={{ color: "#5B5B7A", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>ประวัติการแลก</div>
              <div className="text-md font-mono font-bold text-slate-200 mt-0.5" style={{ fontFamily: "var(--font-noto)" }}>
                {totalRedeemed} รายการ
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls (Tabs and Search) */}
        <div
          className="p-5 rounded-3xl border backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{
            background: "rgba(10, 10, 18, 0.4)",
            borderColor: "rgba(255, 255, 255, 0.05)",
          }}
        >
          {/* Category Tabs */}
          <div className="flex gap-2">
            {[
              { id: "ALL", label: "ทั้งหมด" },
              { id: "NORMAL", label: "ของรางวัลทั่วไป" },
              { id: "LUCKY_DRAW", label: "ลุ้นจับรางวัล" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 border"
                  style={{
                    fontFamily: "var(--font-noto)",
                    background: isActive ? "rgba(192, 132, 252, 0.15)" : "transparent",
                    borderColor: isActive ? "rgba(192, 132, 252, 0.4)" : "transparent",
                    color: isActive ? "#C084FC" : "#8888A8",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Item Search */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="ค้นหาไอเทมของรางวัล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none transition-all placeholder-slate-600 text-xs"
              style={{
                background: "rgba(0,0,0,0.2)",
                borderColor: "rgba(255,255,255,0.06)",
                color: "#FFFFFF",
                fontFamily: "var(--font-noto)",
              }}
            />
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Shop Items Grid */}
        {filteredItems.length === 0 ? (
          <div
            className="p-16 text-center text-slate-500 rounded-3xl border backdrop-blur-md"
            style={{
              background: "rgba(10, 10, 18, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.05)",
              fontFamily: "var(--font-noto)",
            }}
          >
            ไม่พบของรางวัลในหมวดหมู่นี้ หรือประวัติการค้นหานี้
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isLucky = item.type === "LUCKY_DRAW";
              const outOfStock = item.stock <= 0;
              const hasEnoughPoints = pointsBalance >= item.price;
              const isRedeeming = redeemingId === item.id;
              
              // Verify lucky draw dates
              let isDrawClosed = false;
              let drawClosesDateTh = "";
              if (isLucky && item.drawClosesAt) {
                const closesAt = new Date(item.drawClosesAt);
                isDrawClosed = closesAt.getTime() < Date.now();
                drawClosesDateTh = closesAt.toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }) + " น.";
              }

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border overflow-hidden backdrop-blur-md flex flex-col transition-all duration-300 hover:translate-y-[-4px]"
                  style={{
                    background: "rgba(10, 10, 18, 0.4)",
                    borderColor: isLucky ? "rgba(192, 132, 252, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    boxShadow: isLucky ? "inset 0 0 20px rgba(192, 132, 252, 0.02)" : "none",
                  }}
                >
                  {/* Card Image Area */}
                  <div
                    className="h-44 w-full relative flex items-center justify-center border-b"
                    style={{
                      background: "rgba(255, 255, 255, 0.01)",
                      borderColor: "rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Fallback visual design block
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                          style={{
                            background: isLucky ? "rgba(192, 132, 252, 0.05)" : "rgba(6, 182, 212, 0.05)",
                            borderColor: isLucky ? "rgba(192, 132, 252, 0.2)" : "rgba(6, 182, 212, 0.2)",
                            color: isLucky ? "#C084FC" : "#06B6D4",
                          }}
                        >
                          {isLucky ? "🎁" : "💎"}
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
                          No Preview Image
                        </span>
                      </div>
                    )}

                    {/* Lucky draw badge */}
                    {isLucky && (
                      <span
                        className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border"
                        style={{
                          background: "rgba(192, 132, 252, 0.15)",
                          borderColor: "rgba(192, 132, 252, 0.4)",
                          color: "#C084FC",
                          fontFamily: "var(--font-noto)",
                        }}
                      >
                        ลุ้นจับรางวัล
                      </span>
                    )}

                    {/* Stock badge */}
                    <span
                      className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border"
                      style={{
                        background: outOfStock ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.03)",
                        borderColor: outOfStock ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 255, 255, 0.08)",
                        color: outOfStock ? "#EF4444" : "#94A3B8",
                      }}
                    >
                      {outOfStock ? "หมดแล้ว" : `Stock: ${item.stock}`}
                    </span>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                    <div className="space-y-2">
                      <h3
                        className="font-bold text-base text-slate-100 line-clamp-1"
                        style={{ fontFamily: "var(--font-noto)" }}
                      >
                        {item.name}
                      </h3>
                      <p
                        className="text-xs text-slate-500 line-clamp-2 h-8"
                        style={{ fontFamily: "var(--font-noto)" }}
                      >
                        {item.description || "ของรางวัลคุณภาพสำหรับครอบครัว ONIZUKA"}
                      </p>
                    </div>

                    {isLucky && item.drawClosesAt && (
                      <div
                        className="p-3.5 rounded-xl border text-[11px] space-y-1"
                        style={{
                          background: "rgba(192, 132, 252, 0.03)",
                          borderColor: "rgba(192, 132, 252, 0.1)",
                          fontFamily: "var(--font-noto)",
                        }}
                      >
                        <div className="text-slate-500">สุ่มจับผู้โชคดีวันที่:</div>
                        <div className="text-slate-300 font-semibold">{drawClosesDateTh}</div>
                        {isDrawClosed && (
                          <div className="text-red-400 font-bold mt-1 text-[10px] uppercase">
                            ✖ ปิดการร่วมชิงโชคแล้ว
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Price Section */}
                      <div className="flex items-end justify-between">
                        <span className="text-xs text-slate-500" style={{ fontFamily: "var(--font-noto)" }}>
                          ราคาแลกซื้อ
                        </span>
                        <span className="text-xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.3)]">
                          {item.price.toLocaleString()} <span className="text-xs text-slate-600 font-normal">Pts</span>
                        </span>
                      </div>

                      {/* Buy Trigger Button */}
                      {outOfStock ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800/40 border border-slate-700/50 text-slate-600 cursor-not-allowed"
                          style={{ fontFamily: "var(--font-noto)" }}
                        >
                          ไอเทมหมดชั่วคราว
                        </button>
                      ) : isLucky && isDrawClosed ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800/40 border border-slate-700/50 text-slate-600 cursor-not-allowed"
                          style={{ fontFamily: "var(--font-noto)" }}
                        >
                          ปิดการร่วมชิงโชคแล้ว
                        </button>
                      ) : !hasEnoughPoints ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900/30 border border-red-500/10 text-red-400/50 cursor-not-allowed"
                          style={{ fontFamily: "var(--font-noto)" }}
                        >
                          แต้มสะสมไม่พอ (ขาดอีก {(item.price - pointsBalance).toLocaleString()} Pts)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRedeem(item)}
                          disabled={isRedeeming}
                          className="w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 hover:brightness-110 active:scale-[0.98] cursor-pointer"
                          style={{
                            fontFamily: "var(--font-noto)",
                            background: isLucky
                              ? "rgba(192, 132, 252, 0.15)"
                              : "rgba(255, 45, 120, 0.15)",
                            border: isLucky
                              ? "1px solid rgba(192, 132, 252, 0.4)"
                              : "1px solid rgba(255, 45, 120, 0.4)",
                            color: isLucky ? "#C084FC" : "#FF6B9D",
                            boxShadow: isLucky
                              ? "0 2px 10px rgba(192, 132, 252, 0.1)"
                              : "0 2px 10px rgba(255, 45, 120, 0.1)",
                          }}
                        >
                          {isRedeeming ? "กำลังดำเนินรายการ..." : isLucky ? "ซื้อสิทธิ์จับรางวัล" : "แลกของรางวัล"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
