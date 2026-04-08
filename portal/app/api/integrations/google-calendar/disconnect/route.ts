import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveClientIdFromRequest } from "@/lib/getClientId";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = await getEffectiveClientIdFromRequest(session.user);
  if (!clientId) return NextResponse.json({ error: "No client found" }, { status: 400 });

  await prisma.clientConfig.update({
    where: { clientId },
    data: {
      calendarRefreshToken: null,
      calendarAccessToken: null,
      calendarTokenExpiry: null,
      calendarId: null,
      calendarCredentialRef: null,
    },
  });

  return NextResponse.json({ success: true });
}
