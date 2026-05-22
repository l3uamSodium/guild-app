"use client";

import { useState, useEffect } from "react";
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

/* ─── Redeem Confirm Modal ────────────────────────────────── */
function RedeemModal({
  item,
  currentBalance,
  isRedeeming,
  onConfirm,
  onCancel,
}: {
  item: ShopItemData;
  currentBalance: number;
  isRedeeming: boolean;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const maxQtyByPoints = Math.floor(currentBalance / item.price);
  const maxQty = Math.min(item.stock, maxQtyByPoints > 0 ? maxQtyByPoints : 1);

  const totalPrice = item.price * quantity;
  const remaining = currentBalance - totalPrice;
  const isLucky = item.type === "LUCKY_DRAW";

  const handleIncrease = () => {
    if (quantity < maxQty) setQuantity((q) => q + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  useEffect(() => {
    // Lock body scroll
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Top accent */}
        <div
          className="h-[1px] w-full"
          style={{
            background: isLucky
              ? "linear-gradient(90deg, transparent, rgba(192,132,252,0.7), transparent)"
              : "linear-gradient(90deg, transparent, rgba(255,45,120,0.7), rgba(192,132,252,0.4), transparent)",
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <h2
            className="text-sm font-bold text-slate-200"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            {isLucky ? "ยืนยันการซื้อสิทธิ์จับรางวัล" : "ยืนยันการแลกของรางวัล"}
          </h2>
          <button
            onClick={onCancel}
            disabled={isRedeeming}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Item preview */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl border"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderColor: isLucky ? "rgba(192,132,252,0.15)" : "rgba(255,45,120,0.12)",
            }}
          >
            {/* Image or placeholder */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border overflow-hidden"
              style={{
                background: isLucky ? "rgba(192,132,252,0.06)" : "rgba(255,45,120,0.06)",
                borderColor: isLucky ? "rgba(192,132,252,0.15)" : "rgba(255,45,120,0.12)",
              }}
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <svg
                  className="w-6 h-6"
                  style={{ color: isLucky ? "#C084FC" : "#FF2D78", opacity: 0.7 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
              )}
            </div>

            <div className="min-w-0">
              <div
                className="font-bold text-sm text-slate-100 truncate"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                {item.name}
              </div>
              {item.description && (
                <div
                  className="text-[11px] text-slate-500 mt-0.5 line-clamp-2"
                  style={{ fontFamily: "var(--font-noto)" }}
                >
                  {item.description}
                </div>
              )}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between mt-2" style={{ fontFamily: "var(--font-noto)" }}>
            <span className="text-sm text-slate-300 font-semibold">จำนวน</span>
            <div className="flex items-center gap-3">
              <button onClick={handleDecrease} disabled={quantity <= 1 || isRedeeming} className="w-8 h-8 rounded-lg border flex items-center justify-center text-slate-400 disabled:opacity-50 hover:bg-white/5 transition-colors" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
              </button>
              <span className="text-slate-100 font-mono font-bold w-6 text-center">{quantity}</span>
              <button onClick={handleIncrease} disabled={quantity >= maxQty || isRedeeming} className="w-8 h-8 rounded-lg border flex items-center justify-center text-slate-400 disabled:opacity-50 hover:bg-white/5 transition-colors" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          </div>

          {/* Points calculation */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs" style={{ fontFamily: "var(--font-noto)" }}>
              <span className="text-slate-500">แต้มปัจจุบัน</span>
              <span className="font-mono font-bold text-cyan-400">{currentBalance.toLocaleString()} Pts</span>
            </div>
            <div className="flex justify-between items-center text-xs" style={{ fontFamily: "var(--font-noto)" }}>
              <span className="text-slate-500">รวมราคาแลก</span>
              <span
                className="font-mono font-bold"
                style={{ color: isLucky ? "#C084FC" : "#FF6B9D" }}
              >
                - {totalPrice.toLocaleString()} Pts
              </span>
            </div>
            <div
              className="h-[1px] w-full"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
            <div className="flex justify-between items-center" style={{ fontFamily: "var(--font-noto)" }}>
              <span className="text-xs text-slate-400 font-semibold">แต้มคงเหลือหลังแลก</span>
              <span
                className="font-mono font-extrabold text-lg"
                style={{ color: remaining >= 0 ? "#06B6D4" : "#EF4444" }}
              >
                {remaining.toLocaleString()} Pts
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-6 py-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={onCancel}
            disabled={isRedeeming}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 hover:brightness-110"
            style={{
              fontFamily: "var(--font-noto)",
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.08)",
              color: "#8888A8",
            }}
          >
            ยกเลิก
          </button>
          <button
            onClick={() => onConfirm(quantity)}
            disabled={isRedeeming}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              fontFamily: "var(--font-noto)",
              background: isLucky
                ? "rgba(192, 132, 252, 0.15)"
                : "rgba(255, 45, 120, 0.15)",
              border: isLucky
                ? "1px solid rgba(192, 132, 252, 0.35)"
                : "1px solid rgba(255, 45, 120, 0.35)",
              color: isLucky ? "#C084FC" : "#FF6B9D",
              boxShadow: isLucky
                ? "0 0 16px rgba(192,132,252,0.15)"
                : "0 0 16px rgba(255,45,120,0.15)",
            }}
          >
            {isRedeeming ? (
              <>
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                กำลังดำเนินการ...
              </>
            ) : (
              isLucky ? "ยืนยันซื้อสิทธิ์" : "ยืนยันแลกรางวัล"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast Notification ──────────────────────────────────── */
function Toast({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-xl shadow-2xl animate-slide-in-right"
      style={{
        background: type === "success" ? "rgba(8, 20, 14, 0.95)" : "rgba(20, 8, 8, 0.95)",
        borderColor: type === "success" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)",
        boxShadow: type === "success"
          ? "0 0 24px rgba(16,185,129,0.15), 0 16px 32px rgba(0,0,0,0.5)"
          : "0 0 24px rgba(239,68,68,0.15), 0 16px 32px rgba(0,0,0,0.5)",
      }}
    >
      {type === "success" ? (
        <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#10B981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#EF4444" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      )}
      <p
        className="text-sm font-medium text-slate-200"
        style={{ fontFamily: "var(--font-noto)" }}
      >
        {message}
      </p>
    </div>
  );
}

/* ─── Shop Item Card ──────────────────────────────────────── */
function ShopCard({
  item,
  pointsBalance,
  onRedeem,
  isRedeeming,
}: {
  item: ShopItemData;
  pointsBalance: number;
  onRedeem: (item: ShopItemData) => void;
  isRedeeming: boolean;
}) {
  const isLucky = item.type === "LUCKY_DRAW";
  const outOfStock = item.stock <= 0;
  const hasEnough = pointsBalance >= item.price;

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

  const disabled = outOfStock || (isLucky && isDrawClosed) || !hasEnough;

  const accentColor = isLucky ? "#C084FC" : "#FF2D78";
  const accentAlpha = isLucky ? "rgba(192,132,252," : "rgba(255,45,120,";

  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 ${disabled ? "" : "card-hover-glow"} ${disabled ? "" : isLucky ? "card-hover-glow-purple" : ""}`}
      style={{
        background: "rgba(10, 10, 20, 0.55)",
        borderColor: isLucky ? `${accentAlpha}0.12)` : "rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)",
        ...(disabled ? { filter: "grayscale(0.5) brightness(0.65)", opacity: 0.6 } : {}),
      }}
    >
      {/* Image area */}
      <div
        className="h-44 relative flex items-center justify-center border-b overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.01)",
          borderColor: "rgba(255,255,255,0.04)",
        }}
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border"
              style={{
                background: `${accentAlpha}0.05)`,
                borderColor: `${accentAlpha}0.18)`,
              }}
            >
              <svg className="w-6 h-6" style={{ color: accentColor, opacity: 0.7 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
            <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">No Preview</span>
          </div>
        )}

        {/* Badges */}
        {isLucky && (
          <span
            className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase border"
            style={{
              background: "rgba(192,132,252,0.12)",
              borderColor: "rgba(192,132,252,0.3)",
              color: "#C084FC",
              fontFamily: "var(--font-noto)",
            }}
          >
            ลุ้นรางวัล
          </span>
        )}
        <span
          className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold border"
          style={{
            background: outOfStock ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.03)",
            borderColor: outOfStock ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.07)",
            color: outOfStock ? "#EF4444" : "#64748B",
          }}
        >
          {outOfStock ? "หมด" : `x${item.stock}`}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-4">
        <div className="space-y-1.5">
          <h3
            className="font-bold text-sm text-slate-100 line-clamp-1"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            {item.name}
          </h3>
          <p
            className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            {item.description || "ของรางวัลสำหรับสมาชิก ONIZUKA"}
          </p>
        </div>

        {isLucky && item.drawClosesAt && (
          <div
            className="px-3 py-2.5 rounded-xl border text-[11px] space-y-0.5"
            style={{
              background: "rgba(192,132,252,0.04)",
              borderColor: "rgba(192,132,252,0.1)",
              fontFamily: "var(--font-noto)",
            }}
          >
            <div className="text-slate-600">วันสุ่มผู้โชคดี</div>
            <div className="text-slate-300 font-semibold">{drawClosesDateTh}</div>
            {isDrawClosed && (
              <div className="text-red-400 font-bold text-[10px] uppercase tracking-wider pt-0.5">ปิดรับสิทธิ์แล้ว</div>
            )}
          </div>
        )}

        <div className="mt-auto space-y-3">
          {/* Price row */}
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-600" style={{ fontFamily: "var(--font-noto)" }}>
              ราคา
            </span>
            <span
              className="text-xl font-extrabold font-mono"
              style={{
                color: accentColor,
                textShadow: `0 0 20px ${accentAlpha}0.3)`,
              }}
            >
              {item.price.toLocaleString()}
              <span className="text-[11px] font-normal text-slate-600 ml-1">Pts</span>
            </span>
          </div>

          {/* Action button */}
          {!hasEnough && !outOfStock && !(isLucky && isDrawClosed) ? (
            <div
              className="w-full py-2.5 rounded-xl text-[11px] text-center font-semibold border"
              style={{
                fontFamily: "var(--font-noto)",
                background: "rgba(239,68,68,0.05)",
                borderColor: "rgba(239,68,68,0.12)",
                color: "#EF4444",
                opacity: 0.7,
              }}
            >
              แต้มไม่พอ ({(item.price - pointsBalance).toLocaleString()} Pts)
            </div>
          ) : (
            <button
              onClick={() => !disabled && onRedeem(item)}
              disabled={disabled || isRedeeming}
              className="w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border"
              style={{
                fontFamily: "var(--font-noto)",
                background: disabled
                  ? "rgba(255,255,255,0.03)"
                  : `${accentAlpha}0.12)`,
                borderColor: disabled
                  ? "rgba(255,255,255,0.06)"
                  : `${accentAlpha}0.3)`,
                color: disabled ? "#4B4B6A" : accentColor,
                boxShadow: disabled ? "none" : `0 4px 16px ${accentAlpha}0.1)`,
              }}
            >
              {outOfStock
                ? "หมดชั่วคราว"
                : isLucky && isDrawClosed
                ? "ปิดรับแล้ว"
                : isLucky
                ? "ซื้อสิทธิ์ลุ้นรางวัล"
                : "แลกรางวัลนี้"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
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
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<ShopItemData | null>(null);
  
  type NotificationType = { id: number; type: "success" | "error"; message: string };
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const showNotification = (type: "success" | "error", message: string) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const handleConfirmRedeem = async (quantity: number) => {
    if (!confirmItem) return;
    setRedeemingId(confirmItem.id);
    try {
      const res = await redeemItem(confirmItem.id, quantity);
      setConfirmItem(null);
      if (res.success) {
        showNotification(
          "success",
          confirmItem.type === "LUCKY_DRAW"
            ? "เข้าร่วมกิจกรรมลุ้นรับโชคสำเร็จ แต้มของคุณถูกหักเรียบร้อย"
            : "แลกรางวัลสำเร็จ สามารถดูสถานะการจัดส่งได้ที่หน้าแดชบอร์ด"
        );
        router.refresh();
      } else {
        let errMsg = "เกิดข้อผิดพลาดในการแลกรางวัล";
        if (res.error === "OUT_OF_STOCK") errMsg = "สินค้าหมดชั่วคราว";
        if (res.error === "INSUFFICIENT_POINTS") errMsg = "แต้มกิลด์สะสมของคุณไม่เพียงพอ";
        if (res.error === "DRAW_CLOSED") errMsg = "กิจกรรมจับรางวัลนี้ปิดรับสิทธิ์แล้ว";
        showNotification("error", errMsg);
      }
    } catch {
      setConfirmItem(null);
      showNotification("error", "เกิดข้อผิดพลาดจากเครือข่าย กรุณาลองใหม่อีกครั้ง");
    } finally {
      setRedeemingId(null);
    }
  };

  const filteredItems = shopItems.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.type === activeTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: "ALL", label: "ทั้งหมด" },
    { id: "NORMAL", label: "ของรางวัลทั่วไป" },
    { id: "LUCKY_DRAW", label: "ลุ้นจับรางวัล" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#08080F" }}>
      <div className="page-bg" />
      <div className="page-dot-grid" />

      <MemberNavbar
        avatarUrl={memberInfo.avatarUrl}
        inGameName={memberInfo.inGameName}
        role={memberInfo.role}
      />

      {/* Toast */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <Toast type={n.type} message={n.message} />
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmItem && (
        <RedeemModal
          item={confirmItem}
          currentBalance={pointsBalance}
          isRedeeming={redeemingId === confirmItem.id}
          onConfirm={handleConfirmRedeem}
          onCancel={() => setConfirmItem(null)}
        />
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-6 relative z-10">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: "clamp(22px, 4vw, 30px)",
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
            <p
              style={{
                fontFamily: "var(--font-noto)",
                color: "#5B5B7A",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              ใช้แต้มกิลด์แลกของรางวัลพรีเมียมหรือสิทธิ์ลุ้นรับรางวัลใหญ่ประจำซีซัน
            </p>
          </div>

          {/* Balance card */}
          <div
            className="flex items-center gap-6 px-6 py-4 rounded-2xl border backdrop-blur-md flex-shrink-0"
            style={{
              background: "rgba(10, 10, 20, 0.6)",
              borderColor: "rgba(192, 132, 252, 0.15)",
              boxShadow: "0 0 24px rgba(192,132,252,0.04)",
            }}
          >
            <div>
              <div style={{ color: "#5B5B7A", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                แต้มคงเหลือ
              </div>
              <div
                className="text-2xl font-mono font-extrabold mt-0.5"
                style={{
                  color: "#06B6D4",
                  textShadow: "0 0 20px rgba(6,182,212,0.3)",
                }}
              >
                {pointsBalance.toLocaleString()}
                <span className="text-xs font-normal text-slate-500 ml-1">Pts</span>
              </div>
            </div>
            <div className="w-px h-10" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div>
              <div style={{ color: "#5B5B7A", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                แลกแล้ว
              </div>
              <div className="text-lg font-mono font-bold text-slate-300 mt-0.5">
                {totalRedeemed}
                <span className="text-xs font-normal text-slate-600 ml-1">รายการ</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ──────────────────────────────────────── */}
        <div
          className="p-4 rounded-2xl border backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{
            background: "rgba(10, 10, 20, 0.5)",
            borderColor: "rgba(255, 255, 255, 0.05)",
          }}
        >
          {/* Tabs */}
          <div className="flex gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 border"
                  style={{
                    fontFamily: "var(--font-noto)",
                    background: isActive ? "rgba(192,132,252,0.1)" : "transparent",
                    borderColor: isActive ? "rgba(192,132,252,0.3)" : "transparent",
                    color: isActive ? "#C084FC" : "#4B4B6A",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative sm:w-72">
            <input
              type="text"
              placeholder="ค้นหาของรางวัล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-dark w-full pl-9 pr-4 py-2"
              style={{ fontFamily: "var(--font-noto)" }}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "#4B4B6A" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* ── Grid ────────────────────────────────────────────── */}
        {filteredItems.length === 0 ? (
          <div
            className="p-16 text-center text-slate-600 rounded-2xl border"
            style={{
              background: "rgba(10, 10, 18, 0.3)",
              borderColor: "rgba(255,255,255,0.04)",
              fontFamily: "var(--font-noto)",
            }}
          >
            ไม่พบของรางวัลในหมวดหมู่นี้
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <ShopCard
                key={item.id}
                item={item}
                pointsBalance={pointsBalance}
                onRedeem={(item) => setConfirmItem(item)}
                isRedeeming={redeemingId === item.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
