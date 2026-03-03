import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getEffectiveClientId } from "@/lib/getClientId";

type TimelineEvent = {
  id: string;
  type: "call" | "appointment" | "sms" | "lead";
  label: string;
  sublabel: string;
  ts: Date;
  color: string;
};

const OUTCOME_COLOR: Record<string, string> = {
  APPOINTMENT_BOOKED: "#4ade80",
  NEW_LEAD: "#a78bfa",
  CALLBACK_REQUESTED: "#fbbf24",
  VOICEMAIL: "#94a3b8",
  NO_ANSWER: "#94a3b8",
  NOT_INTERESTED: "#f87171",
  WRONG_NUMBER: "#f87171",
  FAQ_HANDLED: "#38bdf8",
};

function outcomeLabel(o: string) {
  return o.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user;
  const clientId = await getEffectiveClientId(user);
  if (!clientId) redirect("/admin");

  const [callLogs, appointments, followups, leads] = await Promise.all([
    prisma.callLog.findMany({
      where: { clientId },
      orderBy: { timestamp: "desc" },
      take: 20,
    }),
    prisma.appointment.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.followup.findMany({
      where: { clientId },
      orderBy: { sentAt: "desc" },
      take: 10,
    }),
    prisma.lead.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const events: TimelineEvent[] = [
    ...callLogs.map((c) => ({
      id: c.id,
      type: "call" as const,
      label: `${outcomeLabel(c.outcome)} — ${c.callerName ?? c.callerPhone}`,
      sublabel: c.callerPhone,
      ts: c.timestamp,
      color: OUTCOME_COLOR[c.outcome] ?? "#a78bfa",
    })),
    ...appointments.map((a) => ({
      id: a.id,
      type: "appointment" as const,
      label: `Appointment ${a.status.toLowerCase().replace(/_/g, " ")} — ${a.callerName ?? a.callerPhone}`,
      sublabel: a.scheduledAt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
      ts: a.createdAt,
      color: a.status === "CONFIRMED" ? "#4ade80" : a.status === "CANCELLED" ? "#f87171" : "#fbbf24",
    })),
    ...followups.map((f) => ({
      id: f.id,
      type: "sms" as const,
      label: `SMS ${f.status.toLowerCase()} via ${f.channel}`,
      sublabel: f.messageBody ? f.messageBody.slice(0, 60) + (f.messageBody.length > 60 ? "…" : "") : "",
      ts: f.sentAt ?? f.createdAt,
      color: f.status === "SENT" ? "#38bdf8" : "#94a3b8",
    })),
    ...leads.map((l) => ({
      id: l.id,
      type: "lead" as const,
      label: `New lead — ${l.businessName ?? l.contactName ?? l.contactPhone ?? "Unknown"}`,
      sublabel: `Source: ${l.source ?? "inbound"} · Score: ${l.icpScore ?? "—"}`,
      ts: l.createdAt,
      color: "#a855f7",
    })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0, 40);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)", color: "#f3f0ff" }}>
          Activity Log
        </h1>
        <p className="text-sm mt-1" style={{ color: "#a78bfa" }}>
          All calls, appointments, SMS, and leads — most recent first
        </p>
      </div>

      {events.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ background: "#0d0a1a", borderColor: "rgba(168,85,247,0.18)" }}
        >
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm" style={{ color: "#a78bfa" }}>No activity yet. Your AI receptionist is ready.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {events.map((ev, i) => (
            <div key={ev.id + i} className="flex gap-4 pb-6 relative">
              {/* Vertical line */}
              {i < events.length - 1 && (
                <div
                  className="absolute"
                  style={{ left: 7, top: 20, bottom: 0, width: 1, background: "rgba(168,85,247,0.15)" }}
                />
              )}
              {/* Dot */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2"
                style={{ background: ev.color, borderColor: "#06040f", zIndex: 1 }}
              />
              {/* Content */}
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "#f3f0ff", lineHeight: 1.5 }}>
                  {ev.label}
                </p>
                {ev.sublabel && (
                  <p className="text-xs mt-0.5" style={{ color: "#6b6b80" }}>{ev.sublabel}</p>
                )}
                <p className="text-xs mt-1" style={{ color: "#a78bfa" }}>
                  {new Date(ev.ts).toLocaleString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                    hour: "numeric", minute: "2-digit",
                  })}
                </p>
              </div>
              {/* Type badge */}
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold self-start flex-shrink-0"
                style={{ background: `${ev.color}18`, color: ev.color, border: `1px solid ${ev.color}40` }}
              >
                {ev.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
