import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Vytvorenie jednej steny
  const wall = await prisma.wall.upsert({
    where: { slug: "hlavna-stena" },
    update: {},
    create: {
      name: "Hlavná stena",
      slug: "hlavna-stena",
    },
  });

  // Admin účet
  const adminHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@prelezy.sk" },
    update: {},
    create: {
      email: "admin@prelezy.sk",
      passwordHash: adminHash,
      displayName: "Admin",
      role: Role.ADMIN,
    },
  });

  // Testovací používateľ
  const userHash = await bcrypt.hash("user123", 12);
  await prisma.user.upsert({
    where: { email: "user@prelezy.sk" },
    update: {},
    create: {
      email: "user@prelezy.sk",
      passwordHash: userHash,
      displayName: "Testovací lezec",
      role: Role.USER,
    },
  });

  // Ukážkové sloty A1–A5
  const slotCodes = ["A1", "A2", "A3", "A4", "A5"];
  for (const code of slotCodes) {
    await prisma.slot.upsert({
      where: { code },
      update: {},
      create: {
        wallId: wall.id,
        code,
        label: `Sektor A – ${code}`,
      },
    });
  }

  // Ukážkové cesty
  const routes = [
    { name: "Červená šesťka", sector: "A", color: "červená", grade: "6a", setDate: new Date("2025-01-15") },
    { name: "Modrá sedmička", sector: "A", color: "modrá", grade: "7a", setDate: new Date("2025-02-01") },
    { name: "Zelená päťka", sector: "B", color: "zelená", grade: "5c", setDate: new Date("2025-01-20") },
    { name: "Žltá osmička", sector: "B", color: "žltá", grade: "8a", setDate: new Date("2025-03-01") },
    { name: "Čierna šestka plus", sector: "A", color: "čierna", grade: "6b+", setDate: new Date("2025-02-15") },
  ];

  const createdRoutes = [];
  for (const r of routes) {
    const route = await prisma.route.upsert({
      where: { id: `seed-${r.grade}-${r.sector}` },
      update: {},
      create: {
        id: `seed-${r.grade}-${r.sector}`,
        wallId: wall.id,
        ...r,
      },
    });
    createdRoutes.push(route);
  }

  // Priradenie prvých 3 ciest k slotom
  for (let i = 0; i < 3; i++) {
    const slot = await prisma.slot.findUnique({ where: { code: slotCodes[i] } });
    if (!slot) continue;
    const existing = await prisma.slotAssignment.findFirst({
      where: { slotId: slot.id, removedAt: null },
    });
    if (!existing) {
      await prisma.slotAssignment.create({
        data: {
          slotId: slot.id,
          routeId: createdRoutes[i].id,
        },
      });
    }
  }

  console.log("Seed dokončený ✓");
  console.log("Admin: admin@prelezy.sk / admin123");
  console.log("User:  user@prelezy.sk / user123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
