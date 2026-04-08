"use client";

import { useEffect, useState, useCallback } from "react";

type AgentStatus = "busy" | "idle" | "not_configured" | "error";

const statusConfig: Record<AgentStatus, { label: string; color: string; pulse: boolean }> = {
  busy: { label: "On a Call", color: "#4ade80", pulse: true },
  idle: { label: "Idle — Ready for calls", color: "#94a3b8", pulse: false },
  not_configured: { label: "Not Configured", color: "#fbbf24", pulse: false },
  error: { label: "Error", color: "#f87171", pulse: false },
};

export default function AgentStatusCard() {
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/client/agent-status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status as AgentStatus);
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const cfg = statusConfig[status];

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: "#0d0a1a", borderColor: "rgba(168,85,247,0.18)" }}
    >
      <p className="text-xs font-medium tracking-wide uppercase mb-3" style={{ color: "#6b6b80" }}>
        Virtual Agent
      </p>
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          {cfg.pulse && (
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: cfg.color }}
            />
          )}
          <span
            className="relative inline-flex rounded-full h-3 w-3"
            style={{ background: cfg.color }}
          />
        </span>
        <span className="text-lg font-semibold" style={{ fontFamily: "var(--font-space-grotesk)", color: "#f3f0ff" }}>
          {loading ? "Checking..." : cfg.label}
        </span>
      </div>
    </div>
  );
}
