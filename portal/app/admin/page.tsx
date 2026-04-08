import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PLAN_LIMITS, billingMonthStart } from "@/lib/plan-limits";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user;
  if (user.role !== "ADMIN") redirect("/dashboard");

  const monthStart = billingMonthStart();

  const [clients, usageRows] = await Promise.all([
    prisma.client.findMany({
      include: { config: true, user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.callLog.groupBy({
      by: ["clientId"],
      where: { createdAt: { gte: monthStart } },
      _sum: { durationSeconds: true },
    }),
  ]);

  const usageMap = new Map(
    usageRows.map((r) => [r.clientId, r._sum.durationSeconds ?? 0])
  );

  const statusColor: Record<string, string> = {
    ACTIVE: "#4ade80",
    INACTIVE: "#fbbf24",
    SUSPENDED: "#f87171",
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)", color: "#f3f0ff" }}>Admin — Clients</h1>
          <p className="text-sm mt-1" style={{ color: "#a78bfa" }}>{clients.length} client{clients.length !== 1 ? "s" : ""} on platform</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}
        >
          + Onboard Client
        </Link>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "#0d0a1a", borderColor: "rgba(168,85,247,0.18)" }}>
        {clients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🏢</p>
            <p className="text-sm" style={{ color: "#a78bfa" }}>No clients yet. Onboard your first client to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(168,85,247,0.15)" }}>
                {["Business", "Plan / Usage", "Status", "AI Phone", "Active", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-medium tracking-wide uppercase" style={{ color: "#6b6b80" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const color = statusColor[client.status] ?? "#a78bfa";
                const usedSeconds = usageMap.get(client.id) ?? 0;
                const planKey = (client.plan ?? "STARTER") as keyof typeof PLAN_LIMITS;
                const limitSeconds = PLAN_LIMITS[planKey]?.seconds ?? PLAN_LIMITS.STARTER.seconds;
                const isUnlimited = !isFinite(limitSeconds);
                const pct = isUnlimited ? 0 : Math.min((usedSeconds / limitSeconds) * 100, 100);
                const usedHrs = (usedSeconds / 3600).toFixed(1);
                const limitHrs = isUnlimited ? null : (limitSeconds / 3600).toFixed(0);
                const barColor = pct >= 100 ? "#f87171" : pct >= 80 ? "#fbbf24" : "#a855f7";
                const capHit = client.config?.active === false && client.status === "ACTIVE";

                return (
                  <tr
                    key={client.id}
                    className="border-b last:border-0"
                    style={{ borderColor: "rgba(168,85,247,0.08)" }}
                  >
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/clients/${client.id}`} className="block hover:opacity-80">
                        <p className="font-medium" style={{ color: "#f3f0ff" }}>{client.businessName}</p>
                        <p className="text-xs" style={{ color: "#6b6b80" }}>{client.industry ?? "—"}</p>
                      </Link>
                    </td>

                    {/* Plan + usage bar */}
                    <td className="px-5 py-3.5" style={{ minWidth: 180 }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs font-semibold" style={{ color: "#a78bfa" }}>{client.plan}</span>
                        {capHit && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(248,113,113,0.15)", color: "#f87171" }}>
                            CAP
                          </span>
                        )}
                      </div>
                      {isUnlimited ? (
                        <p className="text-xs" style={{ color: "#4ade80" }}>Unlimited</p>
                      ) : (
                        <>
                          <div className="w-full h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "rgba(168,85,247,0.12)" }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                          </div>
                          <p className="text-xs" style={{ color: "#6b6b80" }}>
                            {usedHrs} / {limitHrs} hrs ({pct.toFixed(0)}%)
                          </p>
                        </>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${color}18`, color }}>
                        {client.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono" style={{ color: "#6b6b80" }}>
                      {client.config?.vapiPhoneNumber ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: client.config?.active ? "#4ade80" : "#6b6b80" }} />
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(168,85,247,0.25)" }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
