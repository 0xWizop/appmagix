import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminEmail = "merchantmagix@gmail.com";

  const existing = await db.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    // Make sure they have ADMIN role
    await db.user.update({ where: { email: adminEmail }, data: { role: "ADMIN" } });
    console.log("✓ Admin user already exists — role set to ADMIN");
    return;
  }

  const hash = await bcrypt.hash("Admin1234!", 10);
  await db.user.create({
    data: {
      email: adminEmail,
      name: "Webmint Admin",
      passwordHash: hash,
      role: "ADMIN",
    },
  });
  console.log("✓ Created admin user: merchantmagix@gmail.com / Admin1234!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
