"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  status?: string;
};

function parseDate(e: CalendarEvent): Date {
  const raw = e.start.dateTime ?? e.start.date ?? "";
  return new Date(raw);
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  );
}

function dayLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return formatDate(date);
}

type GroupedEvents = { label: string; date: Date; events: CalendarEvent[] }[];

function groupByDay(events: CalendarEvent[]): GroupedEvents {
  const map = new Map<string, { label: string; date: Date; events: CalendarEvent[] }>();
  for (const e of events) {
    const d = parseDate(e);
    const key = d.toDateString();
    if (!map.has(key)) {
      map.set(key, { label: dayLabel(d), date: d, events: [] });
    }
    map.get(key)!.events.push(e);
  }
  return Array.from(map.values());
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/integrations/google-calendar/events")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setConnected(data.connected);
          setEvents(data.events ?? []);
        }
      })
      .catch(() => setError("Failed to load calendar."))
      .finally(() => setLoading(false));
  }, []);

  const grouped = groupByDay(events);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-space-grotesk)", color: "#f3f0ff" }}
          >
            Calendar
          </h1>
          <p className="text-sm mt-1" style={{ color: "#a78bfa" }}>
            Upcoming appointments from your Google Calendar
          </p>
        </div>
        {connected && (
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#4ade80" }} />
            <span className="text-xs font-medium" style={{ color: "#4ade80" }}>Google Calendar Connected</span>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border p-5 animate-pulse"
              style={{ background: "#0d0a1a", borderColor: "rgba(168,85,247,0.18)", height: 80 }}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className="rounded-2xl border p-6 text-center"
          style={{ background: "#0d0a1a", borderColor: "rgba(239,68,68,0.25)" }}
        >
          <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
        </div>
      )}

      {/* Not connected */}
      {!loading && !error && connected === false && (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ background: "#0d0a1a", borderColor: "rgba(168,85,247,0.18)" }}
        >
          <div className="text-4xl mb-4">📅</div>
          <p className="text-base font-semibold mb-2" style={{ color: "#f3f0ff" }}>
            No calendar connected
          </p>
          <p className="text-sm mb-6" style={{ color: "#6b6b80" }}>
            Connect your Google Calendar to view upcoming appointments here.
          </p>
          <Link
            href="/integrations"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
              boxShadow: "0 0 16px rgba(124,58,237,0.4)",
            }}
          >
            Connect Google Calendar
          </Link>
        </div>
      )}

      {/* Connected, no events */}
      {!loading && !error && connected && events.length === 0 && (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ background: "#0d0a1a", borderColor: "rgba(168,85,247,0.18)" }}
        >
          <div className="text-4xl mb-3">✨</div>
          <p className="text-sm" style={{ color: "#a78bfa" }}>
            No upcoming events in the next 30 days.
          </p>
        </div>
      )}

      {/* Events grouped by day */}
      {!loading && !error && connected && events.length > 0 && (
        <div className="space-y-6">
          {grouped.map(({ label, date, events: dayEvents }) => (
            <div key={date.toDateString()}>
              {/* Day header */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: isToday(date) ? "#a855f7" : "#6b6b80" }}
                >
                  {label}
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(168,85,247,0.12)" }} />
              </div>

              {/* Events */}
              <div className="space-y-2">
                {dayEvents.map((event) => {
                  const isAllDay = !event.start.dateTime;
                  const startTime = formatTime(event.start.dateTime);
                  const endTime = formatTime(event.end.dateTime);
                  const isAIBooked = (event.summary ?? "").toLowerCase().includes("appointment") ||
                    (event.description ?? "").toLowerCase().includes("avoma");

                  return (
                    <div
                      key={event.id}
                      className="rounded-xl border p-4 flex items-start gap-4"
                      style={{
                        background: "#0d0a1a",
                        borderColor: isAIBooked ? "rgba(168,85,247,0.3)" : "rgba(168,85,247,0.12)",
                        boxShadow: isAIBooked ? "0 0 12px rgba(124,58,237,0.08)" : "none",
                      }}
                    >
                      {/* Time column */}
                      <div className="flex-shrink-0 w-20 text-right">
                        {isAllDay ? (
                          <span className="text-xs font-medium" style={{ color: "#6b6b80" }}>All day</span>
                        ) : (
                          <>
                            <p className="text-sm font-semibold" style={{ color: "#f3f0ff" }}>{startTime}</p>
                            <p className="text-xs" style={{ color: "#6b6b80" }}>{endTime}</p>
                          </>
                        )}
                      </div>

                      {/* Divider */}
                      <div
                        className="flex-shrink-0 w-0.5 self-stretch rounded-full mt-0.5"
                        style={{ background: isAIBooked ? "rgba(168,85,247,0.5)" : "rgba(168,85,247,0.2)" }}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold truncate" style={{ color: "#f3f0ff" }}>
                            {event.summary ?? "Untitled event"}
                          </p>
                          {isAIBooked && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                              style={{ background: "rgba(168,85,247,0.15)", color: "#a78bfa" }}
                            >
                              AI Booked
                            </span>
                          )}
                        </div>
                        {event.location && (
                          <p className="text-xs mt-0.5 truncate" style={{ color: "#6b6b80" }}>
                            📍 {event.location}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#6b6b80" }}>
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="text-xs text-right mt-4" style={{ color: "#6b6b80" }}>
            Showing {events.length} event{events.length !== 1 ? "s" : ""} over the next 30 days
          </p>
        </div>
      )}
    </div>
  );
}
