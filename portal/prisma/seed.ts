import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DENTAL_FIELDS,
  ROOFING_FIELDS,
  HVAC_FIELDS,
  MEDICAL_FIELDS,
  LEGAL_FIELDS,
  PLUMBING_FIELDS,
  SALON_SPA_FIELDS,
  AUTO_REPAIR_FIELDS,
  VETERINARY_FIELDS,
  NICHE_SYSTEM_PROMPT_ADDON,
  buildVapiSchema,
} from "../lib/niches";

const prisma = new PrismaClient();

const NICHES = [
  { slug: "DENTAL",     displayName: "Dental Practice",          fields: DENTAL_FIELDS },
  { slug: "ROOFING",    displayName: "Roofing Contractor",       fields: ROOFING_FIELDS },
  { slug: "HVAC",       displayName: "HVAC Service",             fields: HVAC_FIELDS },
  { slug: "MEDICAL",    displayName: "Medical / Healthcare",      fields: MEDICAL_FIELDS },
  { slug: "LEGAL",      displayName: "Law Firm / Legal Services", fields: LEGAL_FIELDS },
  { slug: "PLUMBING",   displayName: "Plumbing Service",         fields: PLUMBING_FIELDS },
  { slug: "SALON_SPA",  displayName: "Salon / Spa",              fields: SALON_SPA_FIELDS },
  { slug: "AUTO_REPAIR",displayName: "Auto Repair Shop",         fields: AUTO_REPAIR_FIELDS },
  { slug: "VETERINARY", displayName: "Veterinary Clinic",        fields: VETERINARY_FIELDS },
];

async function main() {
  // ── Admin user ─────────────────────────────────────────────────────────────
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const email = process.env.ADMIN_EMAIL ?? "admin@nexus.local";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`Admin user "${username}" already exists — skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { username, email, passwordHash, role: "ADMIN" },
    });
    console.log(`✓ Admin user created: ${username}`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  → Change this password after first login.`);
  }

  // ── Business type templates ────────────────────────────────────────────────
  for (const niche of NICHES) {
    await prisma.businessTypeTemplate.upsert({
      where: { slug: niche.slug },
      update: {
        displayName: niche.displayName,
        fieldDefinitions: niche.fields as unknown as object[],
        systemPromptAddon: NICHE_SYSTEM_PROMPT_ADDON[niche.slug],
        structuredDataSchema: buildVapiSchema(niche.fields),
        isActive: true,
      },
      create: {
        slug: niche.slug,
        displayName: niche.displayName,
        fieldDefinitions: niche.fields as unknown as object[],
        systemPromptAddon: NICHE_SYSTEM_PROMPT_ADDON[niche.slug],
        structuredDataSchema: buildVapiSchema(niche.fields),
        isActive: true,
      },
    });
    console.log(`✓ Business type template seeded: ${niche.slug}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
