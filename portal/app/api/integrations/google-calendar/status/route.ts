import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.clientId) {
    return NextResponse.json({ connected: false });
  }

  const config = await prisma.clientConfig.findUnique({
    where: { clientId: session.user.clientId },
    select: { calendarRefreshToken: true },
  });

  return NextResponse.json({ connected: !!config?.calendarRefreshToken });
}
