/**
 * Seeds development data per docs-seed-data.md at the repo root:
 * roles, users (admin@nivora.tn, hazem@example.com, islem@example.com),
 * services + plans (prices in minor units), the 5 invitation templates,
 * 6 music tracks, and 2 coupons (LANCEMENT20, MARIAGE10).
 *
 * TODO: implement — this stub only wires up the Prisma client so
 * `pnpm db:seed` runs without error on a fresh clone.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // eslint-disable-next-line no-console
  console.log("Seed: no-op stub. See docs-seed-data.md for the data to load.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
