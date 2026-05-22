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
      onClick={() => !disabled && onRedeem(item)}
      className={`rounded-[2rem] overflow-hidden flex flex-col relative transition-all duration-500 group ${disabled ? "" : "cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-10"}`}
      style={{
        background: "rgba(20, 20, 30, 0.6)",
        border: "1px solid",
        borderColor: isLucky ? `${accentAlpha}0.3)` : "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(24px)",
        ...(isLucky && !disabled ? { boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 0 20px ${accentAlpha}0.05)` } : {}),
        ...(disabled ? { filter: "grayscale(0.6) brightness(0.7)", opacity: 0.7, pointerEvents: "none" } : {}),
      }}
    >
      {/* Glossy shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-30" />

      {/* Top accent for Lucky Draw */}
      {isLucky && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px] z-20"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(192,132,252,0.9) 50%, transparent 100%)",
            boxShadow: "0 0 16px rgba(192,132,252,0.8)"
          }}
        />
      )}
      
      {/* Image area */}
      <div
        className="h-56 relative flex items-center justify-center overflow-hidden"
        style={{ background: "rgba(0,0,0,0.4)" }}
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
            className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase z-10"
            style={{
              background: "rgba(192,132,252,0.9)",
              color: "#FFF",
              boxShadow: "0 2px 10px rgba(192,132,252,0.4)",
              fontFamily: "var(--font-noto)",
            }}
          >
            ลุ้นรางวัล
          </span>
        )}
        <span
          className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold z-10"
          style={{
            background: outOfStock ? "rgba(239,68,68,0.9)" : "rgba(0,0,0,0.6)",
            color: "#FFF",
            backdropFilter: "blur(8px)",
          }}
        >
          {outOfStock ? "หมด" : `x${item.stock}`}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        <div className="space-y-1.5">
          <h3
            className="font-bold text-[13px] text-slate-100 line-clamp-1"
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
              className="text-lg font-extrabold font-mono"
              style={{
                color: accentColor,
                textShadow: `0 0 20px ${accentAlpha}0.3)`,
              }}
            >
              {item.price.toLocaleString()}
              <span className="text-[10px] font-normal text-slate-600 ml-1">Pts</span>
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

export default function ShopClientPage({
  shopItems,
  pointsBalance,
  earnedPoints,
  totalRedeemed,
  memberInfo,
}: ShopClientPageProps) {
  const router = useRouter();
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

  const isSearching = searchQuery.trim().length > 0;
  
  const searchedItems = isSearching 
    ? shopItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const luckyItems = shopItems.filter(item => item.type === "LUCKY_DRAW");
  const normalItems = shopItems.filter(item => item.type === "NORMAL");

  // Determine Featured Item (First active Lucky Draw, or just the first item)
  const featuredItem = luckyItems.find(item => item.stock > 0 && (!item.drawClosesAt || new Date(item.drawClosesAt).getTime() > Date.now())) || shopItems[0];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#06060A" }}>
      {/* Background Layers */}
      <div className="page-bg opacity-50" />
      <div className="page-dot-grid opacity-30" />
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-0 w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/4" />
      <div className="absolute top-1/2 left-0 w-[30vw] h-[30vw] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2" />

      <MemberNavbar
        avatarUrl={memberInfo.avatarUrl}
        inGameName={memberInfo.inGameName}
        role={memberInfo.role}
        points={pointsBalance}
        maxPoints={earnedPoints < 50000 ? 50000 : earnedPoints}
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pt-28 pb-16 space-y-10 relative z-10">
        
        {/* ── Header & Search ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in" style={{ animationDelay: '0ms' }}>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 900,
                letterSpacing: "0.15em",
                background: "linear-gradient(135deg, #FFFFFF 20%, #C084FC 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
                textShadow: "0 4px 30px rgba(192,132,252,0.25)"
              }}
            >
              GUILD SHOP
            </h1>
            <p
              style={{
                fontFamily: "var(--font-noto)",
                color: "#94A3B8",
                fontSize: "15px",
                marginTop: "4px"
              }}
            >
              แลกของรางวัลพรีเมียมและลุ้นรับไอเทมสุดพิเศษประจำซีซัน
            </p>
          </div>

          <div className="relative md:w-80 w-full shrink-0">
            <input
              type="text"
              placeholder="ค้นหาไอเทม..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border text-sm text-white placeholder-slate-500 transition-all focus:border-purple-400 focus:shadow-[0_0_20px_rgba(192,132,252,0.15)]"
              style={{ 
                fontFamily: "var(--font-noto)",
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)"
              }}
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5"
              style={{ color: "#64748B" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {isSearching ? (
          /* ── Search Results View ──────────────────────────────────────── */
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-200" style={{ fontFamily: "var(--font-noto)" }}>
              ผลการค้นหา "{searchQuery}"
            </h2>
            {searchedItems.length === 0 ? (
              <div
                className="p-16 text-center text-slate-500 rounded-3xl"
                style={{ fontFamily: "var(--font-noto)", border: "1px dashed rgba(255,255,255,0.1)" }}
              >
                ไม่พบไอเทมที่ค้นหา
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchedItems.map((item) => (
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
          </div>
        ) : (
          /* ── Storefront View ──────────────────────────────────────────── */
          <div className="space-y-12">
            
            {/* Featured Hero Banner */}
            {featuredItem && (
              <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div 
                  className="relative rounded-[2.5rem] overflow-hidden border group"
                  style={{ 
                    borderColor: featuredItem.type === "LUCKY_DRAW" ? "rgba(192,132,252,0.3)" : "rgba(255,255,255,0.1)",
                    background: "rgba(10,10,15,0.8)"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10" />
                  
                  {/* Background Image Bleed */}
                  {featuredItem.imageUrl && (
                    <div 
                      className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 group-hover:scale-105 transition-transform duration-1000"
                      style={{ backgroundImage: `url(${featuredItem.imageUrl})` }}
                    />
                  )}

                  <div className="relative z-20 flex flex-col md:flex-row items-center p-8 md:p-12 gap-8 min-h-[360px]">
                    <div className="flex-1 space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider"
                        style={{
                          background: featuredItem.type === "LUCKY_DRAW" ? "rgba(192,132,252,0.15)" : "rgba(6,182,212,0.15)",
                          borderColor: featuredItem.type === "LUCKY_DRAW" ? "rgba(192,132,252,0.3)" : "rgba(6,182,212,0.3)",
                          color: featuredItem.type === "LUCKY_DRAW" ? "#D8B4FE" : "#67E8F9"
                        }}
                      >
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: featuredItem.type === "LUCKY_DRAW" ? "#C084FC" : "#06B6D4" }} />
                        {featuredItem.type === "LUCKY_DRAW" ? "Featured Draw" : "Featured Item"}
                      </div>
                      
                      <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-xl" style={{ fontFamily: "var(--font-noto)" }}>
                        {featuredItem.name}
                      </h2>
                      
                      <p className="text-slate-300 max-w-xl text-sm md:text-base leading-relaxed" style={{ fontFamily: "var(--font-noto)" }}>
                        {featuredItem.description || "รางวัลพิเศษสุดพรีเมียมที่คุณไม่ควรพลาด แลกด่วนก่อนของจะหมด!"}
                      </p>

                      <div className="pt-4 flex items-center gap-6">
                        <div className="text-3xl font-black font-mono" style={{ color: featuredItem.type === "LUCKY_DRAW" ? "#C084FC" : "#06B6D4" }}>
                          {featuredItem.price.toLocaleString()} <span className="text-sm font-semibold text-slate-400">Pts</span>
                        </div>
                        <button
                          onClick={() => setConfirmItem(featuredItem)}
                          disabled={featuredItem.stock <= 0 || (featuredItem.type === "LUCKY_DRAW" && featuredItem.drawClosesAt && new Date(featuredItem.drawClosesAt).getTime() < Date.now())}
                          className="px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(192,132,252,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                          style={{
                            fontFamily: "var(--font-noto)",
                            background: featuredItem.type === "LUCKY_DRAW" ? "linear-gradient(135deg, #A855F7, #7E22CE)" : "linear-gradient(135deg, #06B6D4, #0369A1)",
                            color: "#FFF"
                          }}
                        >
                          แลกรางวัลเลย
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lucky Draws Section */}
            {luckyItems.length > 0 && (
              <div className="space-y-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-noto)" }}>
                    <span className="text-purple-400">✨</span> ลุ้นรางวัลพิเศษ
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent ml-4" />
                </div>
                
                <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {luckyItems.map((item) => (
                    <div key={item.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start shrink-0">
                      <ShopCard
                        item={item}
                        pointsBalance={pointsBalance}
                        onRedeem={(item) => setConfirmItem(item)}
                        isRedeeming={redeemingId === item.id}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Normal Items Section */}
            {normalItems.length > 0 && (
              <div className="space-y-5 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-noto)" }}>
                    <span className="text-pink-400">🛍️</span> ของรางวัลทั่วไป
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                  {normalItems.map((item) => (
                    <ShopCard
                      key={item.id}
                      item={item}
                      pointsBalance={pointsBalance}
                      onRedeem={(item) => setConfirmItem(item)}
                      isRedeeming={redeemingId === item.id}
                    />
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
}
