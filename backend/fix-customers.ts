import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  const accountCustomerId = 'e133f5e8-01b1-49d4-b896-fdb68a2ad9b3';
  const ordersCustomerId  = '89627872-7847-41c0-94c1-bc4a4686fc76';

  const accountCustomer = await prisma.customer.findUnique({ where: { id: accountCustomerId } });
  if (!accountCustomer) { console.log('Account customer not found'); return; }

  console.log('Step 1: Clear email from new account to free the unique constraint...');
  await prisma.customer.update({
    where: { id: accountCustomerId },
    data: { email: null },
  });

  console.log('Step 2: Set email & password on customer with orders...');
  await prisma.customer.update({
    where: { id: ordersCustomerId },
    data: {
      email: accountCustomer.email,
      password: accountCustomer.password,
      name: accountCustomer.name,
    },
  });

  console.log('Step 3: Delete the now-empty duplicate account...');
  await prisma.customer.delete({ where: { id: accountCustomerId } });

  const updated = await prisma.customer.findUnique({
    where: { id: ordersCustomerId },
    include: { orders: true },
  });
  console.log(`\n✅ Done! ${updated?.name} | ${updated?.email} | Orders: ${updated?.orders.length}`);
}

fix().finally(() => prisma.$disconnect());
