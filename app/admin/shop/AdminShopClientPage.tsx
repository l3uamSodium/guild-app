"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { createShopItem, updateShopItem, markRedeemDelivered } from "@/app/(admin)/shop/actions";

interface ShopItemData {
  id: string;
  name: string;
  description: string;
  type: "NORMAL" | "LUCKY_DRAW";
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  drawClosesAt: string | null;
  drawWinnerId: string | null;
  createdAt: string;
}

interface RedeemLogData {
  id: string;
  pointsSpent: number;
  status: "PENDING" | "DELIVERED";
  redeemedAt: string;
  deliveredAt: string | null;
  deliveredBy: string | null;
  member: {
    id: string;
    inGameName: string;
    nickname: string;
    discordTag: string;
    avatar: string | null;
  };
  item: {
    id: string;
    name: string;
    type: "NORMAL" | "LUCKY_DRAW";
    imageUrl: string;
  };
}

interface AdminShopClientPageProps {
  initialItems: ShopItemData[];
  initialRedeemLogs: RedeemLogData[];
}

export default function AdminShopClientPage({
  initialItems,
  initialRedeemLogs,
}: AdminShopClientPageProps) {
  const [activeTab, setActiveTab] = useState<"items" | "redeems">("items");
  const [redeemFilter, setRedeemFilter] = useState<"PENDING" | "DELIVERED">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [itemsList, setItemsList] = useState<ShopItemData[]>(initialItems);
  const [redeemList, setRedeemList] = useState<RedeemLogData[]>(initialRedeemLogs);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formStock, setFormStock] = useState(0);
  const [formType, setFormType] = useState<"NORMAL" | "LUCKY_DRAW">("NORMAL");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formDrawClosesAt, setFormDrawClosesAt] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingItemId(null);
    setFormName("");
    setFormDescription("");
    setFormPrice(100);
    setFormStock(10);
    setFormType("NORMAL");
    setFormImageUrl("");
    setFormDrawClosesAt("");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ShopItemData) => {
    setModalMode("edit");
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormDescription(item.description);
    setFormPrice(item.price);
    setFormStock(item.stock);
    setFormType(item.type);
    setFormImageUrl(item.imageUrl);
    setFormDrawClosesAt(item.drawClosesAt ? item.drawClosesAt.split(".")[0].slice(0, 16) : "");
    setFormIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      showNotification("error", "กรุณาระบุชื่อสินค้า");
      return;
    }

    if (formPrice < 0 || formStock < 0) {
      showNotification("error", "ราคาและจำนวนสินค้าต้องไม่ต่ำกว่า 0");
      return;
    }

    startTransition(async () => {
      if (modalMode === "create") {
        const result = await createShopItem({
          name: formName,
          description: formDescription,
          price: formPrice,
          stock: formStock,
          type: formType,
          imageUrl: formImageUrl || undefined,
          drawClosesAt: formType === "LUCKY_DRAW" && formDrawClosesAt ? formDrawClosesAt : null,
        });

        if (result.success && result.item) {
          showNotification("success", "สร้างสินค้าชิ้นใหม่เรียบร้อยแล้ว!");
          const newItemMapped: ShopItemData = {
            id: result.item.id,
            name: result.item.name,
            description: result.item.description || "",
            type: result.item.type,
            price: result.item.price,
            stock: result.item.stock,
            imageUrl: result.item.imageUrl || "",
            isActive: result.item.isActive,
            drawClosesAt: result.item.drawClosesAt ? result.item.drawClosesAt.toISOString() : null,
            drawWinnerId: result.item.drawWinnerId,
            createdAt: result.item.createdAt.toISOString(),
          };
          setItemsList(prev => [newItemMapped, ...prev]);
          setIsModalOpen(false);
        } else {
          showNotification("error", result.error || "เกิดข้อผิดพลาดในการสร้างสินค้า");
        }
      } else if (modalMode === "edit" && editingItemId) {
        const result = await updateShopItem(editingItemId, {
          name: formName,
          description: formDescription,
          price: formPrice,
          stock: formStock,
          type: formType,
          imageUrl: formImageUrl || undefined,
          isActive: formIsActive,
          drawClosesAt: formType === "LUCKY_DRAW" && formDrawClosesAt ? new Date(formDrawClosesAt) : null,
        });

        if (result.success && result.item) {
          showNotification("success", "แก้ไขข้อมูลสินค้าสำเร็จ!");
          const updatedItemMapped: ShopItemData = {
            id: result.item.id,
            name: result.item.name,
            description: result.item.description || "",
            type: result.item.type,
            price: result.item.price,
            stock: result.item.stock,
            imageUrl: result.item.imageUrl || "",
            isActive: result.item.isActive,
            drawClosesAt: result.item.drawClosesAt ? result.item.drawClosesAt.toISOString() : null,
            drawWinnerId: result.item.drawWinnerId,
            createdAt: result.item.createdAt.toISOString(),
          };
          setItemsList(prev => prev.map(item => item.id === editingItemId ? updatedItemMapped : item));
          setIsModalOpen(false);
        } else {
          showNotification("error", result.error || "เกิดข้อผิดพลาดในการแก้ไขสินค้า");
        }
      }
    });
  };

  const handleMarkDelivered = async (id: string, memberName: string, itemName: string) => {
    if (confirm(`คุณยืนยันที่จะทำรายการจัดส่ง "${itemName}" ให้แก่คุณ "${memberName}" แล้วใช่หรือไม่?\nระบบจะส่งข้อความแจ้งเตือนผ่าน Discord DM ทันที`)) {
      startTransition(async () => {
        const result = await markRedeemDelivered(id);
        if (result.success && result.redeem) {
          showNotification("success", `จัดส่ง ${itemName} ให้คุณ ${memberName} สำเร็จ!`);
          setRedeemList(prev =>
            prev.map(log =>
              log.id === id
                ? {
                    ...log,
                    status: "DELIVERED" as const,
                    deliveredAt: new Date().toISOString(),
                    deliveredBy: result.redeem?.deliveredBy || "ADMIN",
                  }
                : log
            )
          );
        } else {
          showNotification("error", result.error || "เกิดข้อผิดพลาดในการทำรายการ");
        }
      });
    }
  };

  // Filters
  const filteredRedeems = redeemList
    .filter(log => log.status === redeemFilter)
    .filter(log => {
      const matchQuery = searchQuery.toLowerCase();
      return (
        log.member.inGameName.toLowerCase().includes(matchQuery) ||
        log.member.nickname.toLowerCase().includes(matchQuery) ||
        log.member.discordTag.toLowerCase().includes(matchQuery) ||
        log.item.name.toLowerCase().includes(matchQuery)
      );
    });

  const formatThaiDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main
      className="min-h-screen relative overflow-hidden px-4 py-12 md:px-8"
      style={{ background: "#08080F" }}
    >
      {/* Background gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 30% 40%, rgba(244,114,182,0.04) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(192,132,252,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(244,114,182,0.4) 1px, transparent 0)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      {/* Top Glow Accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[2px] opacity-60"
        style={{ background: "linear-gradient(90deg, transparent, #F472B6, transparent)" }}
      />

      {/* Notification Toast */}
      {notification && (
        <div
          className="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl border backdrop-filter backdrop-blur-lg flex items-center gap-3 shadow-2xl transition-all duration-300 animate-slide-in"
          style={{
            background: notification.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            borderColor: notification.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
          }}
        >
          {notification.type === "success" ? (
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span style={{ fontFamily: "var(--font-noto)", fontSize: "14px", color: "#E4E4F0" }}>
            {notification.message}
          </span>
        </div>
      )}

      {/* Wrapper */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: "26px",
                fontWeight: 900,
                letterSpacing: "0.08em",
                background: "linear-gradient(135deg, #FFFFFF 20%, #F472B6 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              GUILD SHOP ADMINISTRATION
            </h1>
            <p style={{ color: "#8888A8", fontSize: "14px" }}>
              ระบบจัดการสินค้า จัดการสต็อก และควบคุมคิวการจัดส่งของกิลด์
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 hover:brightness-110 flex items-center gap-2"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(228,228,240,0.15)",
                color: "#E4E4F0",
              }}
            >
              แดชบอร์ด
            </Link>

            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 hover:brightness-110 flex items-center gap-2"
              style={{
                background: "rgba(244, 114, 182, 0.1)",
                borderColor: "rgba(244, 114, 182, 0.25)",
                color: "#F472B6",
              }}
            >
              หน้าร้านค้ากิลด์
            </Link>
          </div>
        </div>

        {/* Backoffice Navigation Submenu */}
        <div
          className="flex flex-wrap gap-2 p-2 rounded-2xl border"
          style={{
            background: "rgba(255,255,255,0.01)",
            borderColor: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(10px)",
          }}
        >
          <a
            href="/members"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            จัดการสมาชิก
          </a>
          <a
            href="/seasons"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            จัดการซีซัน
          </a>
          <a
            href="/admin/leave"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            อนุมัติการพักกิจกรรม
          </a>
          <a
            href="/quest-check"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            ตรวจเควสต์รายวัน
          </a>
          <a
            href="/admin/war-log"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            บันทึกกิลด์วอร์
          </a>
          <a
            href="/admin/watchlist"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            รายชื่อเฝ้าระวัง
          </a>
          <a
            href="/admin/shop"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              fontFamily: "var(--font-noto)",
              background: "rgba(244,114,182,0.15)",
              border: "1px solid rgba(244,114,182,0.4)",
              color: "#F472B6",
            }}
          >
            จัดการร้านค้า
          </a>
        </div>

        {/* Tabs Selection & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div className="flex gap-6">
            <button
              onClick={() => {
                setActiveTab("items");
                setSearchQuery("");
              }}
              className="pb-3 text-sm font-semibold relative transition-colors duration-300 cursor-pointer"
              style={{
                color: activeTab === "items" ? "#F472B6" : "#8888A8",
              }}
            >
              รายการสินค้า ({itemsList.length})
              {activeTab === "items" && (
                <span
                  className="absolute bottom-0 left-0 w-full h-[2px] rounded-full shadow-[0_0_8px_#F472B6]"
                  style={{ background: "#F472B6" }}
                />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("redeems");
                setSearchQuery("");
              }}
              className="pb-3 text-sm font-semibold relative transition-colors duration-300 cursor-pointer"
              style={{
                color: activeTab === "redeems" ? "#F472B6" : "#8888A8",
              }}
            >
              ประวัติและคิวจัดส่ง ({redeemList.length})
              {activeTab === "redeems" && (
                <span
                  className="absolute bottom-0 left-0 w-full h-[2px] rounded-full shadow-[0_0_8px_#F472B6]"
                  style={{ background: "#F472B6" }}
                />
              )}
            </button>
          </div>

          <div>
            {activeTab === "items" ? (
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 hover:brightness-110 active:scale-[0.97] cursor-pointer flex items-center gap-2"
                style={{
                  background: "rgba(192, 132, 252, 0.15)",
                  borderColor: "rgba(192, 132, 252, 0.4)",
                  color: "#C084FC",
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มสินค้าใหม่
              </button>
            ) : (
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex rounded-xl border border-border/60 bg-[#0F0F14]/50 overflow-hidden p-0.5">
                  <button
                    onClick={() => setRedeemFilter("PENDING")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      redeemFilter === "PENDING"
                        ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                        : "text-slate-400 border border-transparent hover:bg-white/5"
                    }`}
                  >
                    รอดำเนินการ ({redeemList.filter(l => l.status === "PENDING").length})
                  </button>
                  <button
                    onClick={() => setRedeemFilter("DELIVERED")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      redeemFilter === "DELIVERED"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        : "text-slate-400 border border-transparent hover:bg-white/5"
                    }`}
                  >
                    จัดส่งแล้ว ({redeemList.filter(l => l.status === "DELIVERED").length})
                  </button>
                </div>

                <div className="relative w-48 sm:w-56">
                  <input
                    type="text"
                    placeholder="ค้นหาผู้ซื้อ, สินค้า..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-[#0F0F14]/50 text-xs focus:border-accent focus:outline-none transition duration-300"
                  />
                  <svg className="w-3.5 h-3.5 text-[#4B4B6A] absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab 1: ITEMS INVENTORY */}
        {activeTab === "items" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {itemsList.map(item => (
              <div
                key={item.id}
                className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between backdrop-filter backdrop-blur-xl ${
                  item.isActive
                    ? "border-border/60 hover:border-pink-500/30 shadow-[0_0_15px_rgba(255,255,255,0.01)]"
                    : "border-dashed border-red-500/15 opacity-60 grayscale-[40%]"
                }`}
                style={{ background: "rgba(26,26,36,0.3)" }}
              >
                {/* Header Image or Placeholder */}
                <div className="relative w-full aspect-video bg-surface/40 flex items-center justify-center overflow-hidden border-b border-border/40">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover transition duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-[#4B4B6A]">
                      <svg className="w-8 h-8 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-[10px] uppercase font-bold tracking-wider">No Image</span>
                    </div>
                  )}

                  {/* Type badge */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {item.type === "LUCKY_DRAW" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 uppercase shadow-lg">
                        Lucky Draw 🎫
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 border border-pink-500/40 text-pink-300 uppercase shadow-lg">
                        Normal 🎁
                      </span>
                    )}

                    {!item.isActive && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 border border-rose-500/45 text-rose-400 uppercase shadow-lg">
                        Archived
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#8888A8] line-clamp-2 h-8 leading-relaxed">
                      {item.description || "ไม่มีรายละเอียดสินค้า"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-t border-b border-border/40 py-2 text-xs">
                      <div>
                        <span className="text-[#8888A8] block text-[10px] uppercase">Price</span>
                        <span className="text-sm font-black text-pink-400">{item.price} แต้ม</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#8888A8] block text-[10px] uppercase">Stock</span>
                        <span className={`text-sm font-black ${item.stock > 0 ? "text-white" : "text-rose-400"}`}>
                          {item.stock} ชิ้น
                        </span>
                      </div>
                    </div>

                    {/* LUCKY DRAW extra info */}
                    {item.type === "LUCKY_DRAW" && item.drawClosesAt && (
                      <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[11px] text-[#A78BFA] space-y-1">
                        <span className="block text-[10px] uppercase font-bold text-purple-400 opacity-80">ปิดสุ่มรางวัล:</span>
                        <span className="block font-semibold">{formatThaiDate(item.drawClosesAt)}</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <button
                      onClick={() => openEditModal(item)}
                      disabled={isPending}
                      className="w-full py-2 rounded-xl border text-xs font-bold transition-all duration-300 hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderColor: "rgba(228,228,240,0.15)",
                        color: "#E4E4F0",
                      }}
                    >
                      <svg className="w-3.5 h-3.5 text-[#8888A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      แก้ไขรายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: DELIVERY QUEUE */}
        {activeTab === "redeems" && (
          <div
            className="rounded-3xl border border-border overflow-hidden backdrop-filter backdrop-blur-xl"
            style={{ background: "rgba(26,26,36,0.3)" }}
          >
            {filteredRedeems.length === 0 ? (
              <div className="p-16 text-center text-[#8888A8] space-y-2">
                <svg className="w-12 h-12 mx-auto text-[#4B4B6A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="font-semibold text-sm">ไม่พบรายการแลกสินค้าในสถานะนี้</p>
                <p className="text-xs text-[#5B5B7A]">ข้อมูลสอดคล้องตามตัวกรองการค้นหาของคุณ</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 text-xs font-semibold text-[#8888A8] uppercase tracking-wider bg-surface/10">
                      <th className="px-6 py-4">ผู้แลกสินค้า</th>
                      <th className="px-6 py-4">สินค้า</th>
                      <th className="px-6 py-4">แต้มที่ใช้</th>
                      <th className="px-6 py-4">เวลาแลกสินค้า</th>
                      {redeemFilter === "DELIVERED" ? (
                        <th className="px-6 py-4">เวลาจัดส่ง / ผู้ส่ง</th>
                      ) : (
                        <th className="px-6 py-4 text-right">การจัดการ</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-sm">
                    {filteredRedeems.map(log => (
                      <tr
                        key={log.id}
                        className="hover:bg-surface/20 transition duration-300"
                      >
                        {/* Member Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-surface-2 border border-border flex items-center justify-center">
                              {log.member.avatar ? (
                                <Image
                                  src={log.member.avatar}
                                  alt={log.member.nickname}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-[#8888A8] text-xs font-bold uppercase">
                                  {log.member.nickname[0]}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white leading-tight">
                                {log.member.inGameName}
                              </p>
                              <p className="text-xs text-[#8888A8]">
                                {log.member.nickname} • @{log.member.discordTag}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Shop Item Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-10 h-7 rounded bg-surface/40 border border-border/30 overflow-hidden flex items-center justify-center">
                              {log.item.imageUrl ? (
                                <Image
                                  src={log.item.imageUrl}
                                  alt={log.item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <svg className="w-3.5 h-3.5 text-[#4B4B6A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs leading-snug">
                                {log.item.name}
                              </p>
                              <span className="text-[9px] uppercase px-1.5 py-0.2 bg-white/5 border border-white/10 rounded text-slate-400">
                                {log.item.type}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Points Spent */}
                        <td className="px-6 py-4 font-black text-pink-400 whitespace-nowrap">
                          {log.pointsSpent} pts
                        </td>

                        {/* Redeemed At */}
                        <td className="px-6 py-4 text-[#8888A8] text-xs whitespace-nowrap">
                          {formatThaiDate(log.redeemedAt)}
                        </td>

                        {/* Delivery Time or Action */}
                        {redeemFilter === "DELIVERED" ? (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-emerald-400 text-xs font-semibold">
                              จัดส่งแล้ว
                            </div>
                            <p className="text-[10px] text-[#8888A8]">
                              {log.deliveredAt ? formatThaiDate(log.deliveredAt) : ""}
                            </p>
                          </td>
                        ) : (
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleMarkDelivered(log.id, log.member.inGameName, log.item.name)}
                              disabled={isPending}
                              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wide border transition-all duration-300 hover:brightness-110 active:scale-[0.97] cursor-pointer"
                              style={{
                                background: "rgba(16, 185, 129, 0.12)",
                                borderColor: "rgba(16, 185, 129, 0.35)",
                                color: "#4ADE80",
                              }}
                            >
                              ทำเครื่องหมายจัดส่งแล้ว
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM DIALOG OVERLAY (MODAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Overlay background */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-filter backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div
            className="relative z-10 w-full max-w-lg rounded-3xl border border-border bg-[#0C0C14] shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow: "0 0 40px rgba(244,114,182,0.1)",
            }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-lg font-black tracking-wider uppercase text-white"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                {modalMode === "create" ? "เพิ่มสินค้าชิ้นใหม่" : "แก้ไขรายละเอียดสินค้า"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#4B4B6A] hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8888A8] uppercase tracking-wider block">
                  ชื่อสินค้า *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น เสื้อยืดกิลด์ ONIZUKA, บัตรทรูมันนี่..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#08080F] text-white focus:border-accent focus:outline-none transition duration-300 text-sm"
                />
              </div>

              {/* Product Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8888A8] uppercase tracking-wider block">
                  รายละเอียดสินค้า
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="คำแนะนำหรือข้อจำกัดในการใช้งานรางวัลกิลด์..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#08080F] text-white focus:border-accent focus:outline-none transition duration-300 text-sm resize-none"
                />
              </div>

              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8888A8] uppercase tracking-wider block">
                    ประเภทสินค้า
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as "NORMAL" | "LUCKY_DRAW")}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#08080F] text-white focus:border-accent focus:outline-none transition duration-300 text-sm"
                  >
                    <option value="NORMAL">สินค้าทั่วไป (Normal)</option>
                    <option value="LUCKY_DRAW">จับสลากรางวัล (Lucky Draw)</option>
                  </select>
                </div>

                {/* Price (Spent Points) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8888A8] uppercase tracking-wider block">
                    ราคา (แต้ม)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#08080F] text-white focus:border-accent focus:outline-none transition duration-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Stock inventory */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8888A8] uppercase tracking-wider block">
                    จำนวนสินค้าในสต็อก
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#08080F] text-white focus:border-accent focus:outline-none transition duration-300 text-sm"
                  />
                </div>

                {/* Image URL input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8888A8] uppercase tracking-wider block">
                    รูปภาพ (URL)
                  </label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://cdn.discordapp.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#08080F] text-white focus:border-accent focus:outline-none transition duration-300 text-sm"
                  />
                </div>
              </div>

              {/* LUCKY DRAW end time date (Conditional) */}
              {formType === "LUCKY_DRAW" && (
                <div className="space-y-1 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 animate-fade-in">
                  <label className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                    เวลาปิดสุ่มรางวัล (Lucky Draw Ends At) *
                  </label>
                  <input
                    type="datetime-local"
                    required={formType === "LUCKY_DRAW"}
                    value={formDrawClosesAt}
                    onChange={(e) => setFormDrawClosesAt(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-purple-500/30 bg-[#08080F] text-white focus:border-purple-400 focus:outline-none transition duration-300 text-sm"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              )}

              {/* Toggle isActive (Edit Mode only) */}
              {modalMode === "edit" && (
                <div className="flex items-center gap-3 py-2 border-t border-b border-border/40">
                  <input
                    type="checkbox"
                    id="isActiveCheckbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-[#08080F] text-pink-500 focus:ring-0 accent-pink-500 cursor-pointer"
                  />
                  <label htmlFor="isActiveCheckbox" className="text-xs font-bold text-white cursor-pointer select-none">
                    เปิดใช้งานสินค้านี้ในร้านค้า (Active)
                  </label>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl border text-xs font-semibold hover:bg-white/5 transition cursor-pointer"
                  style={{
                    borderColor: "rgba(228,228,240,0.15)",
                    color: "#E4E4F0",
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold border transition duration-300 hover:brightness-110 active:scale-95 cursor-pointer"
                  style={{
                    background: "rgba(244,114,182,0.15)",
                    borderColor: "rgba(244,114,182,0.4)",
                    color: "#F472B6",
                  }}
                >
                  {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </main>
  );
}
