import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.clientId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
  });

  if (!lead || lead.clientId !== session.user.clientId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch call history for this lead's phone number, scoped to this client
  const callHistory = lead.contactPhone
    ? await prisma.callLog.findMany({
        where: { clientId: session.user.clientId, callerPhone: lead.contactPhone },
        orderBy: { timestamp: "desc" },
        take: 20,
      })
    : [];

  return NextResponse.json({ lead, callHistory });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.clientId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead || lead.clientId !== session.user.clientId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { status } = await req.json();
  const validStatuses = ["NEW", "CONTACTED", "FOLLOW_UP_1", "FOLLOW_UP_2", "SEQUENCE_COMPLETE", "CONVERTED", "NOT_QUALIFIED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.lead.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json({ success: true, status: updated.status });
}
