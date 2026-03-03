import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const INTEGRATIONS = [
  {
    icon: "📞",
    iconBg: "rgba(74,222,128,0.1)",
    name: "Twilio",
    desc: "Voice calls, SMS, and WhatsApp messaging for your AI receptionist.",
    status: "connected" as const,
  },
  {
    icon: "🗓️",
    iconBg: "rgba(96,165,250,0.1)",
    name: "Google Calendar",
    desc: "Book, reschedule, and cancel appointments directly from calls.",
    status: "connected" as const,
  },
  {
    icon: "🤖",
    iconBg: "rgba(168,85,247,0.1)",
    name: "Vapi",
    desc: "AI voice layer that handles inbound and outbound phone calls.",
    status: "connected" as const,
  },
  {
    icon: "🧠",
    iconBg: "rgba(232,121,249,0.1)",
    name: "Claude AI",
    desc: "Analyzes call transcripts, scores leads, and drafts follow-up content.",
    status: "connected" as const,
  },
  {
    icon: "📧",
    iconBg: "rgba(251,191,36,0.1)",
    name: "Gmail / Outlook",
    desc: "Let your agent send, read, and manage emails on your behalf.",
    status: "soon" as const,
  },
  {
    icon: "🗂️",
    iconBg: "rgba(251,191,36,0.1)",
    name: "Notion",
    desc: "Sync tasks, notes, and knowledge bases with your agent.",
    status: "soon" as const,
  },
  {
    icon: "💬",
    iconBg: "rgba(168,85,247,0.1)",
    name: "Slack",
    desc: "Receive agent updates and commands directly in Slack channels.",
    status: "soon" as const,
  },
  {
    icon: "📊",
    iconBg: "rgba(232,121,249,0.1)",
    name: "HubSpot CRM",
    desc: "Automatically log calls, tasks, and contacts to your CRM.",
    status: "soon" as const,
  },
  {
    icon: "🔗",
    iconBg: "rgba(45,212,191,0.1)",
    name: "Zapier / Make",
    desc: "Connect any app using no-code automation workflows.",
    status: "soon" as const,
  },
];

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)", color: "#f3f0ff" }}>
          Integrations
        </h1>
        <p className="text-sm mt-1" style={{ color: "#a78bfa" }}>
          Tools connected to your AI receptionist pipeline.
        </p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {INTEGRATIONS.map((ig) => (
          <div
            key={ig.name}
            className="rounded-2xl border flex flex-col gap-3 p-5 transition-all"
            style={{ background: "#0d0a1a", borderColor: "rgba(168,85,247,0.18)" }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: ig.iconBg }}
            >
              {ig.icon}
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-sm" style={{ fontFamily: "var(--font-space-grotesk)", color: "#f3f0ff" }}>
                {ig.name}
              </p>
              {ig.status === "connected" ? (
                <span
                  className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold border flex-shrink-0"
                  style={{ color: "#4ade80", borderColor: "rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.07)" }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }}/>
                  Connected
                </span>
              ) : (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-bold border flex-shrink-0"
                  style={{ color: "#fbbf24", borderColor: "rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.08)" }}
                >
                  Coming Soon
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#a78bfa" }}>
              {ig.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
