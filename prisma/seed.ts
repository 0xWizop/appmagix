import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const testEmail = "test@merchantmagix.com";
  const testPassword = "Test1234"; // Change in production!

  const existing = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  if (existing) {
    console.log("Test user already exists. Use: test@merchantmagix.com / Test1234");
    return;
  }

  const passwordHash = await bcrypt.hash(testPassword, 12);
  await prisma.user.create({
    data: {
      email: testEmail,
      name: "Test User",
      passwordHash,
      role: "CLIENT",
    },
  });

  console.log("✓ Created test user:");
  console.log("  Email:    test@merchantmagix.com");
  console.log("  Password: Test1234");
  console.log("\nYou can now log in at http://localhost:3001/login");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
