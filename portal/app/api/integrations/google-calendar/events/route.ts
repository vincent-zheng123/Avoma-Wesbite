import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveClientId } from "@/lib/getClientId";

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to refresh token");
  return data.access_token;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = await getEffectiveClientId(session.user);
  if (!clientId) return NextResponse.json({ error: "No client linked" }, { status: 400 });

  const config = await prisma.clientConfig.findUnique({
    where: { clientId },
    select: {
      calendarRefreshToken: true,
      calendarId: true,
    },
  });

  if (!config?.calendarRefreshToken) {
    return NextResponse.json({ connected: false, events: [] });
  }

  const accessToken = await refreshAccessToken(config.calendarRefreshToken);

  const calendarId = encodeURIComponent(config.calendarId ?? "primary");
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days out

  const eventsRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const eventsData = await eventsRes.json();

  if (!eventsRes.ok) {
    return NextResponse.json({ error: "Failed to fetch events", details: eventsData }, { status: 502 });
  }

  return NextResponse.json({ connected: true, events: eventsData.items ?? [] });
}
