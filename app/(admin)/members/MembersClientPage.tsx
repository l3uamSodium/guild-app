"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { approveMember, deactivateMember, updateMemberType } from "./actions";

interface MemberData {
  id: string;
  inGameName: string;
  nickname: string;
  discordTag: string;
  avatar: string | null;
  memberType: "NORMAL" | "WAR";
  createdAt: string;
}

interface MembersClientPageProps {
  initialPending: MemberData[];
  initialActive: MemberData[];
  defaultTab: "pending" | "active";
}

export default function MembersClientPage({
  initialPending,
  initialActive,
  defaultTab,
}: MembersClientPageProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "active">(defaultTab);
  const [pendingList, setPendingList] = useState<MemberData[]>(initialPending);
  const [activeList, setActiveList] = useState<MemberData[]>(initialActive);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPendingAction, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleApprove = async (id: string, name: string) => {
    if (confirm(`คุณต้องการอนุมัติ "${name}" เข้าสู่กิลด์ใช่หรือไม่?`)) {
      startTransition(async () => {
        const result = await approveMember(id);
        if (result.success) {
          showNotification("success", `อนุมัติ ${name} เรียบร้อยแล้ว!`);
          // Move item from pending list to active list
          const approvedMember = pendingList.find(m => m.id === id);
          if (approvedMember) {
            setPendingList(prev => prev.filter(m => m.id !== id));
            setActiveList(prev => [approvedMember, ...prev]);
          }
        } else {
          showNotification("error", result.error || "เกิดข้อผิดพลาดในการอนุมัติ");
        }
      });
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (confirm(`คุณต้องการปิดใช้งานสิทธิ์สมาชิกของ "${name}" ใช่หรือไม่?`)) {
      startTransition(async () => {
        const result = await deactivateMember(id);
        if (result.success) {
          showNotification("success", `ปิดใช้งานสิทธิ์ของ ${name} เรียบร้อยแล้ว!`);
          // Move item out of active list
          setActiveList(prev => prev.filter(m => m.id !== id));
        } else {
          showNotification("error", result.error || "เกิดข้อผิดพลาด");
        }
      });
    }
  };

  const handleToggleType = async (id: string, name: string, currentType: "NORMAL" | "WAR") => {
    const nextType = currentType === "NORMAL" ? "WAR" : "NORMAL";
    const nextTypeLabel = nextType === "WAR" ? "สายวอ" : "สมาชิกปกติ";
    if (confirm(`คุณต้องการเปลี่ยนประเภทของ "${name}" เป็น "${nextTypeLabel}" ใช่หรือไม่?`)) {
      startTransition(async () => {
        const result = await updateMemberType(id, nextType);
        if (result.success) {
          showNotification("success", `เปลี่ยนประเภทของ ${name} เป็น ${nextTypeLabel} สำเร็จ!`);
          setActiveList(prev =>
            prev.map(m => (m.id === id ? { ...m, memberType: nextType } : m))
          );
          setPendingList(prev =>
            prev.map(m => (m.id === id ? { ...m, memberType: nextType } : m))
          );
        } else {
          showNotification("error", result.error || "เกิดข้อผิดพลาดในการเปลี่ยนประเภท");
        }
      });
    }
  };

  const currentList = activeTab === "pending" ? pendingList : activeList;
  const filteredList = currentList.filter(
    m =>
      m.inGameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.discordTag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (isoString: string) => {
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
          background: "radial-gradient(ellipse 60% 60% at 30% 40%, rgba(255,45,120,0.05) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(88,101,242,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,45,120,0.4) 1px, transparent 0)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      {/* Top Glow Accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[2px] opacity-60"
        style={{ background: "linear-gradient(90deg, transparent, #FF2D78, transparent)" }}
      />

      {/* Notification Toast */}
      {notification && (
        <div
          className="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl border backdrop-filter backdrop-blur-lg flex items-center gap-3 shadow-2xl transition-all duration-300 "
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
          <div>
            <div className="flex items-center gap-3">
              <h1
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontSize: "24px",
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  background: "linear-gradient(135deg, #FFFFFF 20%, #FF6B9D 80%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textTransform: "uppercase",
                }}
              >
                ONIZUKA
              </h1>
            </div>
            <p style={{ fontFamily: "var(--font-noto)", color: "#5B5B7A", fontSize: "14px", marginTop: "4px" }}>
              ระบบจัดการและควบคุมรายชื่อสมาชิกกิลด์
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div
              className="px-5 py-3 rounded-2xl border"
              style={{
                background: "rgba(255,255,255,0.01)",
                borderColor: "rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ color: "#5B5B7A", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>รออนุมัติ</div>
              <div className="text-xl font-bold" style={{ color: "#FF6B9D" }}>{pendingList.length} คน</div>
            </div>
            <div
              className="px-5 py-3 rounded-2xl border"
              style={{
                background: "rgba(255,255,255,0.01)",
                borderColor: "rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ color: "#5B5B7A", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>สมาชิกทั้งหมด</div>
              <div className="text-xl font-bold" style={{ color: "#FFFFFF" }}>{activeList.length} คน</div>
            </div>
          </div>
        </div>
        {/* Admin Quick Navigation Command Bar */}
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
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              fontFamily: "var(--font-noto)",
              background: "rgba(255,45,120,0.15)",
              border: "1px solid rgba(255,45,120,0.4)",
              color: "#FF6B9D",
            }}
          >
            จัดการสมาชิก
          </a>
          <a
            href="/seasons"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            จัดการซีซัน
          </a>
          <a
            href="/admin/leave"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            อนุมัติการพักกิจกรรม
          </a>
          <a
            href="/quest-check"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            ตรวจเควสต์รายวัน
          </a>
          <a
            href="/admin/war-log"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            บันทึกกิลด์วอร์
          </a>
          <a
            href="/admin/watchlist"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            รายชื่อเฝ้าระวัง
          </a>
          <a
            href="/admin/shop"
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 border border-transparent text-slate-400"
            style={{
              fontFamily: "var(--font-noto)",
            }}
          >
            จัดการร้านค้า
          </a>
        </div>

        {/* Action Bar (Tabs & Search) */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl border"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,45,120,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300 relative overflow-hidden"
              style={{
                fontFamily: "var(--font-noto)",
                fontSize: "14px",
                color: activeTab === "pending" ? "#FFFFFF" : "#5B5B7A",
                background: activeTab === "pending" ? "rgba(255,45,120,0.1)" : "transparent",
                border: activeTab === "pending" ? "1px solid rgba(255,45,120,0.3)" : "1px solid transparent",
              }}
            >
              รออนุมัติ ({pendingList.length})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className="px-5 py-2.5 rounded-xl font-medium transition-all duration-300 relative overflow-hidden"
              style={{
                fontFamily: "var(--font-noto)",
                fontSize: "14px",
                color: activeTab === "active" ? "#FFFFFF" : "#5B5B7A",
                background: activeTab === "active" ? "rgba(255,45,120,0.1)" : "transparent",
                border: activeTab === "active" ? "1px solid rgba(255,45,120,0.3)" : "1px solid transparent",
              }}
            >
              สมาชิกปกติ ({activeList.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 md:max-w-xs">
            <input
              type="text"
              placeholder="ค้นหาชื่อเกม / ชื่อเล่น / Discord..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-white outline-none transition-all pl-10"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "var(--font-noto)",
                fontSize: "13px",
              }}
            />
            <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </div>

        {/* Members Table Card */}
        <div
          className="rounded-3xl border overflow-hidden relative"
          style={{
            background: "rgba(255,255,255,0.01)",
            borderColor: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          }}
        >
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    borderColor: "rgba(255,255,255,0.05)",
                    background: "rgba(255,255,255,0.005)",
                  }}
                >
                  <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider" style={{ fontFamily: "var(--font-noto)" }}>โปรไฟล์ Discord</th>
                  <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider" style={{ fontFamily: "var(--font-noto)" }}>ชื่อในเกม (IGN)</th>
                  <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider" style={{ fontFamily: "var(--font-noto)" }}>ชื่อเล่น</th>
                  <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider" style={{ fontFamily: "var(--font-noto)" }}>ประเภทสมาชิก</th>
                  <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider" style={{ fontFamily: "var(--font-noto)" }}>วันที่ส่งข้อมูล</th>
                  <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right" style={{ fontFamily: "var(--font-noto)" }}>จัดการสิทธิ์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500" style={{ fontFamily: "var(--font-noto)", fontSize: "14px" }}>
                      ไม่พบรายชื่อที่ต้องการค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredList.map(member => (
                    <tr
                      key={member.id}
                      className="hover:bg-white/[0.01] transition-colors"
                      style={{ fontSize: "14px" }}
                    >
                      {/* Profile Card */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                            {member.avatar ? (
                              <Image src={member.avatar} alt={member.discordTag} width={36} height={36} className="object-cover" />
                            ) : (
                              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{member.discordTag}</span>
                          </div>
                        </div>
                      </td>

                      {/* IGN */}
                      <td className="px-6 py-4 font-medium" style={{ color: "#FF6B9D" }}>
                        {member.inGameName}
                      </td>

                      {/* Nickname */}
                      <td className="px-6 py-4 text-slate-300">
                        {member.nickname}
                      </td>

                      {/* Member Type Badge */}
                      <td className="px-6 py-4">
                        {member.memberType === "WAR" ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                            style={{
                              background: "rgba(255, 45, 120, 0.08)",
                              borderColor: "rgba(255, 45, 120, 0.3)",
                              color: "#FF6B9D",
                              boxShadow: "0 0 10px rgba(255, 45, 120, 0.15)",
                              fontFamily: "var(--font-noto)"
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D78] " />
                            สายวอ
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                            style={{
                              background: "rgba(88, 101, 242, 0.05)",
                              borderColor: "rgba(88, 101, 242, 0.2)",
                              color: "#8B95F6",
                              fontFamily: "var(--font-noto)"
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]" />
                            คนปกติ
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDate(member.createdAt)}
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {activeTab === "pending" ? (
                            <button
                              onClick={() => handleApprove(member.id, member.inGameName)}
                              disabled={isPendingAction}
                              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                              style={{
                                background: "rgba(16,185,129,0.15)",
                                border: "1px solid rgba(16,185,129,0.35)",
                                color: "#34D399",
                              }}
                            >
                              อนุมัติสมาชิก
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleToggleType(member.id, member.inGameName, member.memberType)}
                                disabled={isPendingAction}
                                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                style={{
                                  background: member.memberType === "WAR" ? "rgba(88, 101, 242, 0.12)" : "rgba(255, 45, 120, 0.12)",
                                  border: member.memberType === "WAR" ? "1px solid rgba(88, 101, 242, 0.3)" : "1px solid rgba(255, 45, 120, 0.3)",
                                  color: member.memberType === "WAR" ? "#8B95F6" : "#FF6B9D",
                                }}
                              >
                                {member.memberType === "WAR" ? "ตั้งเป็นคนปกติ" : "ตั้งเป็นสายวอ"}
                              </button>
                              <button
                                onClick={() => handleDeactivate(member.id, member.inGameName)}
                                disabled={isPendingAction}
                                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                style={{
                                  background: "rgba(239,68,68,0.1)",
                                  border: "1px solid rgba(239,68,68,0.3)",
                                  color: "#F87171",
                                }}
                              >
                                ปิดใช้งาน
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <a
            href="/"
            className="px-6 py-2.5 rounded-xl transition-all hover:bg-white/5 border border-white/5 text-slate-500 text-xs font-medium"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            ย้อนกลับหน้าแรก
          </a>
        </div>
      </div>
    </main>
  );
}
