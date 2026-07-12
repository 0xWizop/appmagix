const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.user.upsert({
  where: { email: 'merchantmagix@gmail.com' },
  update: { role: 'ADMIN' },
  create: { email: 'merchantmagix@gmail.com', name: 'Admin', role: 'ADMIN' }
}).then(u => {
  console.log('Admin ready:', u.email, u.role);
  return db.$disconnect();
}).catch(e => {
  console.error(e);
  return db.$disconnect();
});
