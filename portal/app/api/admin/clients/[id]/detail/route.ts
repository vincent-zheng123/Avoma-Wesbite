import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [client, appointments] = await Promise.all([
    prisma.client.findUnique({
      where: { id: params.id },
      include: {
        config: {
          select: {
            vapiPhoneNumber: true,
            active: true,
            calendarType: true,
            calendarId: true,
            calendarRefreshToken: true,
          },
        },
        callLogs: {
          orderBy: { timestamp: "desc" },
          take: 20,
          select: {
            id: true,
            callerName: true,
            callerPhone: true,
            outcome: true,
            durationSeconds: true,
            timestamp: true,
            qualificationData: true,
          },
        },
      },
    }),
    prisma.appointment.findMany({
      where: { clientId: params.id },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        callerName: true,
        callerPhone: true,
        scheduledAt: true,
        status: true,
      },
    }),
  ]);

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ ...client, appointments });
}
