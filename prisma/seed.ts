import { seedDatabase } from "../src/lib/seed";
import { prisma } from "../src/lib/prisma";

seedDatabase()
  .then((r) => {
    console.log("🌱 Seeding Pyatakov Media…");
    console.log(`✅ Done. Articles: ${r.articles}, authors: ${r.authors}, categories: ${r.categories}.`);
    console.log(`   Admin login: ${r.admin} / ${process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026"}`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
