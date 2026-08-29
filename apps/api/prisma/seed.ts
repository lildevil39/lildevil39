/**
 * Seeds development data per docs-seed-data.md at the repo root.
 *
 * Implemented: the 3 seed users (admin@nivora.tn, hazem@example.com,
 * islem@example.com), argon2id-hashed, upserted so `pnpm db:seed` is safe
 * to re-run.
 *
 * TODO: services + plans (prices in minor units), the 5 invitation
 * templates, 6 music tracks, 2 coupons, and hazem/islem's sample
 * projects/RSVPs — see docs-seed-data.md for the exact data.
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

async function upsertUser(input: {
  email: string;
  password: string;
  role: "ADMIN" | "CUSTOMER";
  firstName: string;
  lastName: string;
  verified: boolean;
}) {
  const passwordHash = await hash(input.password);
  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      passwordHash,
      role: input.role,
      emailVerifiedAt: input.verified ? new Date() : null,
    },
    create: {
      email: input.email,
      passwordHash,
      role: input.role,
      emailVerifiedAt: input.verified ? new Date() : null,
      profile: { create: { firstName: input.firstName, lastName: input.lastName } },
    },
  });
  // eslint-disable-next-line no-console
  console.log(`  ${input.email} (${input.role})`);
  return user;
}

async function main() {
  // eslint-disable-next-line no-console
  console.log("Seeding users…");
  await upsertUser({
    email: "admin@nivora.tn",
    password: "Nivora!Admin2026",
    role: "ADMIN",
    firstName: "Admin",
    lastName: "NIVORA",
    verified: true,
  });
  await upsertUser({
    email: "hazem@example.com",
    password: "Password!2026",
    role: "CUSTOMER",
    firstName: "Hazem",
    lastName: "Test",
    verified: true,
  });
  await upsertUser({
    email: "islem@example.com",
    password: "Password!2026",
    role: "CUSTOMER",
    firstName: "Islem",
    lastName: "Test",
    verified: true,
  });
  // eslint-disable-next-line no-console
  console.log("Done. Services/plans/templates/music/coupons still TODO — see docs-seed-data.md.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
