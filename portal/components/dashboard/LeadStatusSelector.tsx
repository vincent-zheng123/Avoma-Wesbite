"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "FOLLOW_UP_1", label: "Follow Up 1" },
  { value: "FOLLOW_UP_2", label: "Follow Up 2" },
  { value: "SEQUENCE_COMPLETE", label: "Sequence Complete" },
  { value: "CONVERTED", label: "Converted" },
  { value: "NOT_QUALIFIED", label: "Not Qualified" },
];

export default function LeadStatusSelector({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleChange(newStatus: string) {
    setSaving(true);
    const res = await fetch(`/api/client/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setStatus(newStatus);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => (
        <button
          key={s.value}
          onClick={() => handleChange(s.value)}
          disabled={saving || s.value === status}
          className="text-xs px-3 py-1.5 rounded-full font-medium transition-opacity"
          style={{
            background: s.value === status ? "rgba(168,85,247,0.3)" : "rgba(168,85,247,0.08)",
            color: s.value === status ? "#f3f0ff" : "#a78bfa",
            border: `1px solid ${s.value === status ? "rgba(168,85,247,0.6)" : "rgba(168,85,247,0.15)"}`,
            opacity: saving ? 0.6 : 1,
            cursor: saving || s.value === status ? "default" : "pointer",
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
