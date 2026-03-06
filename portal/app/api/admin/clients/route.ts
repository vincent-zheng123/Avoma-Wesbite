import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IndustryType } from "@prisma/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const {
  businessName, contactName, email, phone, industry, location, plan,
  monthlyRevenue, calendarId,
  businessHoursStart, businessHoursEnd, timezone,
  aiName, aiGender, businessAddress, emergencyPhone, firstMessage,
} = body;

  if (!businessName || !contactName || !email) {
    return NextResponse.json({ error: "Missing required fields: businessName, contactName, email." }, { status: 400 });
  }

  // Validate industry if provided
  const validIndustries = Object.values(IndustryType);
  if (industry && !validIndustries.includes(industry as IndustryType)) {
    return NextResponse.json(
      { error: `Invalid industry. Must be one of: ${validIndustries.join(", ")}` },
      { status: 400 }
    );
  }

  // Check email uniqueness
  const existingEmail = await prisma.client.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ error: "A client with that email already exists." }, { status: 409 });
  }

  // Create client + config in a transaction.
  // Phone numbers and portal user are provisioned by n8n after this returns.
  const result = await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        businessName,
        contactName,
        email,
        phone: phone || null,
        industry: (industry as IndustryType) || null,
        location: location || null,
        plan: plan || "STARTER",
        status: "ACTIVE",
        monthlyRevenue: monthlyRevenue || null,
        aiName:             aiName             || null,
        aiGender:           aiGender           || "neutral",
        businessAddress:    businessAddress    || null,
        emergencyPhone:     emergencyPhone     || null,
        firstMessage:       firstMessage       || null,
        businessHoursStart: businessHoursStart || "9:00 AM",
        businessHoursEnd:   businessHoursEnd   || "5:00 PM",
        timezone:           timezone           || "America/New_York",
      },
    });

    await tx.clientConfig.create({
      data: {
        clientId: client.id,
        // vapiPhoneNumber left null — n8n purchases and writes it
        vapiPhoneNumber: null,
        vapiAssistantId: null,
        calendarType: "google",
        calendarId: calendarId || null,
        businessHoursStart: businessHoursStart || "09:00",
        businessHoursEnd: businessHoursEnd || "17:00",
        timezone: timezone || "America/New_York",
        active: true,
      },
    });

    return { clientId: client.id };
  });

  // Fire n8n admin-client-setup webhook — non-blocking
  const n8nWebhookUrl = process.env.N8N_ADMIN_SETUP_WEBHOOK_URL;
  if (n8nWebhookUrl) {
    fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: result.clientId }),
    }).catch(() => {});
  }

  return NextResponse.json({ success: true, ...result }, { status: 201 });
}
