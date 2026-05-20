"use client";

import { useState, useEffect } from "react";

interface LeaveItem {
  id: string;
  date: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface RedeemItem {
  id: string;
  itemName: string;
  pointsSpent: number;
  status: string;
  redeemedAt: string;
}

interface HistoryPanelsProps {
  leaveRequests: LeaveItem[];
  recentRedeems: RedeemItem[];
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDING:   { label: "รอตรวจสอบ",  color: "#FACC15", bg: "rgba(250,204,21,0.08)",  border: "rgba(250,204,21,0.2)"  },
    APPROVED:  { label: "อนุมัติ",     color: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)"  },
    REJECTED:  { label: "ไม่อนุมัติ", color: "#EF4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"   },
    DELIVERED: { label: "จัดส่งแล้ว", color: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)"  },
    PENDING_DELIVERY: { label: "รอจัดส่ง", color: "#E4E4F0", bg: "rgba(228,228,240,0.05)", border: "rgba(228,228,240,0.12)" },
  };
  const cfg = map[status] ?? { label: status, color: "#8888A8", bg: "rgba(136,136,168,0.08)", border: "rgba(136,136,168,0.2)" };
  return (
    <span
      className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide border whitespace-nowrap flex-shrink-0"
      style={{
        fontFamily: "var(--font-noto)",
        color: cfg.color,
        background: cfg.bg,
        borderColor: cfg.border,
      }}
    >
      {cfg.label}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─── Leave Rows ──────────────────────────────────────────── */
function LeaveRow({ item }: { item: LeaveItem }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border transition-all duration-200 hover:bg-white/[0.015]"
      style={{ background: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.04)" }}
    >
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-300" style={{ fontFamily: "var(--font-noto)" }}>
          {fmtDate(item.date)}
        </div>
        <div className="text-[11px] text-slate-600 truncate mt-0.5" style={{ fontFamily: "var(--font-noto)" }}>
          {item.reason}
        </div>
      </div>
      <StatusBadge status={item.status} />
    </div>
  );
}

/* ─── Redeem Rows ─────────────────────────────────────────── */
function RedeemRow({ item }: { item: RedeemItem }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border transition-all duration-200 hover:bg-white/[0.015]"
      style={{ background: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.04)" }}
    >
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-300 truncate" style={{ fontFamily: "var(--font-noto)" }}>
          {item.itemName}
        </div>
        <div className="text-[11px] text-slate-600 mt-0.5 font-mono">
          แลกเมื่อ {fmtDate(item.redeemedAt)} · {item.pointsSpent.toLocaleString()} Pts
        </div>
      </div>
      <StatusBadge status={item.status} />
    </div>
  );
}

/* ─── View-All Modal ──────────────────────────────────────── */
function ViewAllModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Lock body scroll
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal top accent */}
        <div
          className="h-[1px] w-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,45,120,0.6), rgba(192,132,252,0.4), transparent)",
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h2
            className="text-sm font-bold text-slate-200"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-2 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Panel Card ──────────────────────────────────────────── */
function PanelCard({
  title,
  subtitle,
  empty,
  emptyText,
  onViewAll,
  children,
}: {
  title: string;
  subtitle: string;
  empty: boolean;
  emptyText: string;
  onViewAll: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl border overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        borderColor: "rgba(255, 45, 120, 0.15)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 20px rgba(255, 45, 120, 0.03)",
      }}
    >
      {/* Panel top accent */}
      <div
        className="h-[1px] w-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }}
      />

      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div>
          <div className="text-xs font-bold text-slate-300" style={{ fontFamily: "var(--font-noto)" }}>{title}</div>
          <div className="text-[10px] text-slate-600 mt-0.5">{subtitle}</div>
        </div>
        {!empty && (
          <button
            onClick={onViewAll}
            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all duration-200 hover:brightness-110"
            style={{
              fontFamily: "var(--font-noto)",
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.08)",
              color: "#8888A8",
            }}
          >
            ดูทั้งหมด
          </button>
        )}
      </div>

      {/* Panel body */}
      <div className="flex-1 p-4 space-y-2">
        {empty ? (
          <div
            className="py-10 text-center text-slate-600 text-xs"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            {emptyText}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/* ─── Main Export ─────────────────────────────────────────── */
export default function HistoryPanels({ leaveRequests, recentRedeems }: HistoryPanelsProps) {
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);

  const PREVIEW = 4;

  return (
    <>
      {/* Panels grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Leave history */}
        <PanelCard
          title="ประวัติการขอพักกิจกรรม"
          subtitle="บันทึกการขอพักประจำซีซัน"
          empty={leaveRequests.length === 0}
          emptyText="ไม่มีประวัติการขอพักกิจกรรมในซีซันนี้"
          onViewAll={() => setLeaveModalOpen(true)}
        >
          {leaveRequests.slice().reverse().slice(0, PREVIEW).map((item) => (
            <LeaveRow key={item.id} item={item} />
          ))}
        </PanelCard>

        {/* Redeem history */}
        <PanelCard
          title="ประวัติการแลกของรางวัล"
          subtitle="รายการแลกรางวัลทั้งหมด"
          empty={recentRedeems.length === 0}
          emptyText="ไม่มีประวัติการแลกของรางวัล"
          onViewAll={() => setRedeemModalOpen(true)}
        >
          {recentRedeems.slice(0, PREVIEW).map((item) => (
            <RedeemRow key={item.id} item={item} />
          ))}
        </PanelCard>
      </div>

      {/* Leave modal */}
      {leaveModalOpen && (
        <ViewAllModal title="ประวัติการขอพักกิจกรรม (ทั้งหมด)" onClose={() => setLeaveModalOpen(false)}>
          {leaveRequests.length === 0 ? (
            <p className="text-center text-slate-600 text-xs py-8" style={{ fontFamily: "var(--font-noto)" }}>
              ไม่มีประวัติ
            </p>
          ) : (
            leaveRequests.slice().reverse().map((item) => (
              <LeaveRow key={item.id} item={item} />
            ))
          )}
        </ViewAllModal>
      )}

      {/* Redeem modal */}
      {redeemModalOpen && (
        <ViewAllModal title="ประวัติการแลกของรางวัล (ทั้งหมด)" onClose={() => setRedeemModalOpen(false)}>
          {recentRedeems.length === 0 ? (
            <p className="text-center text-slate-600 text-xs py-8" style={{ fontFamily: "var(--font-noto)" }}>
              ไม่มีประวัติ
            </p>
          ) : (
            recentRedeems.map((item) => (
              <RedeemRow key={item.id} item={item} />
            ))
          )}
        </ViewAllModal>
      )}
    </>
  );
}
