/**
 * Seeds development data per docs-seed-data.md at the repo root.
 *
 * Implemented: the 3 seed users, the 6 services + their Starter/Premium
 * plans (prices in minor units), and the 5 invitation templates.
 * Upserted throughout, so `pnpm db:seed` is safe to re-run.
 *
 * TODO: music tracks, coupons, and hazem/islem's sample projects/RSVPs —
 * see docs-seed-data.md for the exact data.
 */
import { PrismaClient, type PlanTier } from "@prisma/client";
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
  await prisma.user.upsert({
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
  console.log(`  user: ${input.email} (${input.role})`);
}

interface SeedPlan {
  tier: PlanTier;
  priceTnd: number;
  priceEur: number;
  featuresFr: string[];
}

interface SeedService {
  key: string;
  nameFr: string;
  nameEn: string;
  taglineFr: string;
  taglineEn: string;
  icon: string;
  sortOrder: number;
  plans: SeedPlan[];
}

const SERVICES: SeedService[] = [
  {
    key: "wedding-invitation",
    nameFr: "Invitation de mariage digitale",
    nameEn: "Digital wedding invitation",
    taglineFr: "Une invitation élégante, personnalisée, partagée en un lien",
    taglineEn: "An elegant, personalized invitation, shared as one link",
    icon: "Heart",
    sortOrder: 1,
    plans: [
      {
        tier: "STARTER",
        priceTnd: 79000,
        priceEur: 2500,
        featuresFr: ["1 template", "50 RSVP", "musique bibliothèque"],
      },
      {
        tier: "PREMIUM",
        priceTnd: 149000,
        priceEur: 4500,
        featuresFr: ["tous templates", "RSVP illimité", "musique personnalisée", "galerie", "vœux"],
      },
    ],
  },
  {
    key: "wedding-video",
    nameFr: "Invitation vidéo de mariage",
    nameEn: "Wedding video invitation",
    taglineFr: "Votre histoire racontée en une courte vidéo animée",
    taglineEn: "Your story told in a short animated video",
    icon: "Video",
    sortOrder: 2,
    plans: [
      { tier: "STARTER", priceTnd: 129000, priceEur: 4000, featuresFr: ["30 s", "1 style", "10 photos"] },
      {
        tier: "PREMIUM",
        priceTnd: 249000,
        priceEur: 7500,
        featuresFr: ["60 s", "tous styles", "30 photos", "révisions"],
      },
    ],
  },
  {
    key: "cv",
    nameFr: "CV / Resume",
    nameEn: "CV / Resume",
    taglineFr: "Un CV professionnel prêt à envoyer",
    taglineEn: "A professional CV, ready to send",
    icon: "FileText",
    sortOrder: 3,
    plans: [
      { tier: "STARTER", priceTnd: 39000, priceEur: 1200, featuresFr: ["1 template", "PDF"] },
      {
        tier: "PREMIUM",
        priceTnd: 69000,
        priceEur: 2100,
        featuresFr: ["tous templates", "PDF + lien public", "relecture"],
      },
    ],
  },
  {
    key: "business-card",
    nameFr: "Carte de visite digitale",
    nameEn: "Digital business card",
    taglineFr: "Partagez vos coordonnées en un scan",
    taglineEn: "Share your contact details with one scan",
    icon: "CreditCard",
    sortOrder: 4,
    plans: [
      { tier: "STARTER", priceTnd: 29000, priceEur: 900, featuresFr: ["carte digitale", "QR"] },
      {
        tier: "PREMIUM",
        priceTnd: 49000,
        priceEur: 1500,
        featuresFr: ["+ fichiers impression", "logo intégré"],
      },
    ],
  },
  {
    key: "logo",
    nameFr: "Logo",
    nameEn: "Logo",
    taglineFr: "Un logo qui vous représente",
    taglineEn: "A logo that represents you",
    icon: "Sparkles",
    sortOrder: 5,
    plans: [
      { tier: "STARTER", priceTnd: 99000, priceEur: 3000, featuresFr: ["3 propositions", "PNG/SVG"] },
      {
        tier: "PREMIUM",
        priceTnd: 199000,
        priceEur: 6000,
        featuresFr: ["6 propositions", "déclinaisons", "sources"],
      },
    ],
  },
  {
    key: "brand-identity",
    nameFr: "Identité de marque",
    nameEn: "Brand identity",
    taglineFr: "Une identité visuelle complète et cohérente",
    taglineEn: "A complete, consistent visual identity",
    icon: "Palette",
    sortOrder: 6,
    plans: [
      {
        tier: "STARTER",
        priceTnd: 299000,
        priceEur: 9000,
        featuresFr: ["logo", "palette", "typo", "guide court"],
      },
      {
        tier: "PREMIUM",
        priceTnd: 599000,
        priceEur: 18000,
        featuresFr: ["+ carte de visite", "réseaux sociaux", "guide complet"],
      },
    ],
  },
];

const INVITATION_TEMPLATES = [
  {
    code: "INV-01",
    name: "Elegant Ivory",
    palette: { ivory: "#F7F2EA", champagne: "#C9B392", burgundy: "#8A1C30" },
  },
  { code: "INV-02", name: "Luxury Gold", palette: { cream: "#F6F1E7", gold: "#B68235", ink: "#201F1D" } },
  {
    code: "INV-03",
    name: "Minimal White",
    palette: { white: "#FCFCFB", greige: "#D8D3CA", charcoal: "#2E2C29" },
  },
  {
    code: "INV-04",
    name: "Floral Rose",
    palette: { blush: "#F8EFEC", dustyRose: "#B9868A", sage: "#8B9484" },
  },
  {
    code: "INV-05",
    name: "Modern Black & Gold",
    palette: { nearBlack: "#14120F", gold: "#C9A227", bone: "#EDE7DA" },
  },
];

async function main() {
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

  console.log("Seeding services + plans…");
  for (const svc of SERVICES) {
    const service = await prisma.service.upsert({
      where: { key: svc.key },
      update: {
        nameFr: svc.nameFr,
        nameEn: svc.nameEn,
        taglineFr: svc.taglineFr,
        taglineEn: svc.taglineEn,
        icon: svc.icon,
        sortOrder: svc.sortOrder,
      },
      create: {
        key: svc.key,
        nameFr: svc.nameFr,
        nameEn: svc.nameEn,
        taglineFr: svc.taglineFr,
        taglineEn: svc.taglineEn,
        icon: svc.icon,
        sortOrder: svc.sortOrder,
      },
    });

    for (const plan of svc.plans) {
      await prisma.servicePlan.upsert({
        where: { serviceId_tier: { serviceId: service.id, tier: plan.tier } },
        update: { priceTnd: plan.priceTnd, priceEur: plan.priceEur, featuresFr: plan.featuresFr, featuresEn: plan.featuresFr },
        create: {
          serviceId: service.id,
          tier: plan.tier,
          priceTnd: plan.priceTnd,
          priceEur: plan.priceEur,
          featuresFr: plan.featuresFr,
          featuresEn: plan.featuresFr, // TODO: real EN translations
        },
      });
    }
    console.log(`  service: ${svc.key} (${svc.plans.length} plans)`);
  }

  console.log("Seeding invitation templates…");
  const invitationService = await prisma.service.findUniqueOrThrow({
    where: { key: "wedding-invitation" },
  });
  for (const [i, tpl] of INVITATION_TEMPLATES.entries()) {
    await prisma.serviceTemplate.upsert({
      where: { serviceId_code: { serviceId: invitationService.id, code: tpl.code } },
      update: { name: tpl.name, config: tpl.palette, sortOrder: i },
      create: {
        serviceId: invitationService.id,
        code: tpl.code,
        name: tpl.name,
        config: tpl.palette,
        sortOrder: i,
      },
    });
    console.log(`  template: ${tpl.code} — ${tpl.name}`);
  }

  console.log("Done. Music tracks, coupons, and sample projects/RSVPs still TODO.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
