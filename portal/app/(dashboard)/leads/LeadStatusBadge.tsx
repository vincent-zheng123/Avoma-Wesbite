"use client";
import { useState, useRef, useEffect } from "react";

const statusColor: Record<string, string> = {
  NEW: "#a78bfa",
  CONTACTED: "#38bdf8",
  FOLLOW_UP_1: "#fbbf24",
  FOLLOW_UP_2: "#fb923c",
  SEQUENCE_COMPLETE: "#94a3b8",
  CONVERTED: "#4ade80",
  BOOKED: "#38bdf8",
  NOT_QUALIFIED: "#f87171",
};

const statusLabel: Record<string, string> = {
  NEW: "new",
  CONTACTED: "contacted",
  FOLLOW_UP_1: "follow up 1",
  FOLLOW_UP_2: "follow up 2",
  SEQUENCE_COMPLETE: "sequence complete",
  CONVERTED: "in pipeline",
  BOOKED: "booked",
  NOT_QUALIFIED: "not qualified",
};

const UPDATE_OPTIONS = [
  { value: "CONVERTED", label: "in pipeline" },
  { value: "BOOKED", label: "booked" },
  { value: "NOT_QUALIFIED", label: "not qualified" },
];

export function LeadStatusBadge({
  leadId,
  initialStatus,
}: {
  leadId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const color = statusColor[status] ?? "#a78bfa";
  const label = statusLabel[status] ?? status.replace(/_/g, " ").toLowerCase();

  const handleSelect = async (newStatus: string) => {
    if (newStatus === status) { setOpen(false); return; }
    setUpdating(true);
    setOpen(false);
    try {
      await fetch(`/api/client/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
    } catch {
      // status stays unchanged on error
    }
    setUpdating(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-opacity"
        style={{
          background: `${updating ? "#6b6b80" : color}18`,
          color: updating ? "#6b6b80" : color,
          cursor: "pointer",
        }}
      >
        {updating ? "saving…" : label}
      </button>

      {open && (
        <div
          className="absolute z-50 top-full left-0 mt-1 rounded-xl border shadow-2xl py-1.5"
          style={{
            background: "#0d0a1a",
            borderColor: "rgba(168,85,247,0.25)",
            minWidth: "140px",
          }}
        >
          <p
            className="px-3 pb-1 text-[10px] font-medium uppercase tracking-wider"
            style={{ color: "#3a3a50" }}
          >
            Update stage
          </p>
          {UPDATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="w-full text-left px-3 py-1.5 text-xs transition-colors"
              style={{
                color: statusColor[opt.value],
                background:
                  opt.value === status
                    ? `${statusColor[opt.value]}15`
                    : "transparent",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.background = `${statusColor[opt.value]}15`)
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.background =
                  opt.value === status ? `${statusColor[opt.value]}15` : "transparent")
              }
            >
              {opt.value === status ? "✓ " : "  "}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
