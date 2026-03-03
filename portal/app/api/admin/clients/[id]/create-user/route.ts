import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * POST /api/admin/clients/[id]/create-user
 *
 * Internal endpoint called by n8n during automated client onboarding.
 * Creates the portal user record with a hashed password and sends no redirect.
 *
 * Auth: x-internal-secret header (same pattern as /provision).
 * Body: { username: string, password: string, email: string }
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const internalSecret = req.headers.get("x-internal-secret");
  const validSecret = process.env.INTERNAL_API_SECRET;

  if (!validSecret || internalSecret !== validSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = params.id;
  const body = await req.json();
  const { username, password, email } = body;

  if (!username || !password || !email) {
    return NextResponse.json(
      { error: "Missing required fields: username, password, email." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  const existingUser = await prisma.user.findUnique({ where: { clientId } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Portal user already exists for this client." },
      { status: 409 }
    );
  }

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    return NextResponse.json({ error: "Username already taken." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const portalUser = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role: "CLIENT",
      clientId,
    },
  });

  return NextResponse.json(
    { success: true, userId: portalUser.id, username: portalUser.username },
    { status: 201 }
  );
}
