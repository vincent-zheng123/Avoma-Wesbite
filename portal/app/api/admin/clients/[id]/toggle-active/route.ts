import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlinkVapiPhoneWithFallback, relinkVapiPhone } from "@/lib/vapi-client";

/**
 * POST /api/admin/clients/[id]/toggle-active
 *
 * Body: { active: boolean }
 *
 * active = true  → re-links Vapi phone to assistant, sets client_config.active = true
 * active = false → unlinks Vapi phone (calls forward to client's emergency_phone),
 *                  sets client_config.active = false
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "active (boolean) is required" }, { status: 400 });
  }

  const { active } = body;

  const [client, config] = await Promise.all([
    prisma.client.findUnique({ where: { id: params.id }, select: { id: true, emergencyPhone: true } }),
    prisma.clientConfig.findUnique({ where: { clientId: params.id } }),
  ]);

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  if (!config) return NextResponse.json({ error: "Client config not found" }, { status: 404 });

  let vapiError: string | null = null;

  if (active) {
    // Turn on — re-link phone to assistant
    if (config.vapiPhoneNumberId && config.vapiAssistantId) {
      try {
        await relinkVapiPhone(config.vapiPhoneNumberId, config.vapiAssistantId);
      } catch (err) {
        vapiError = err instanceof Error ? err.message : String(err);
      }
    } else {
      vapiError = "vapiPhoneNumberId or vapiAssistantId not set — Vapi link skipped";
    }
  } else {
    // Turn off — unlink phone, forward calls to emergency fallback
    if (config.vapiPhoneNumberId) {
      const fallback = client.emergencyPhone ?? "";
      try {
        await unlinkVapiPhoneWithFallback(config.vapiPhoneNumberId, fallback);
      } catch (err) {
        vapiError = err instanceof Error ? err.message : String(err);
      }
    } else {
      vapiError = "vapiPhoneNumberId not set — Vapi unlink skipped";
    }
  }

  // Update DB regardless of Vapi result.
  // On first activation, stamp liveSince — this anchors proration for the billing month.
  await prisma.clientConfig.update({
    where: { clientId: params.id },
    data: {
      active,
      ...(active && !config.liveSince ? { liveSince: new Date() } : {}),
    },
  });

  await prisma.automationRun.create({
    data: {
      workflowName: active ? "admin-activate-client" : "admin-deactivate-client",
      clientId: params.id,
      status: vapiError ? "completed_with_warnings" : "completed",
      startedAt: new Date(),
      completedAt: new Date(),
      errorMessage: vapiError,
    },
  });

  return NextResponse.json({ success: true, active, vapiError });
}
