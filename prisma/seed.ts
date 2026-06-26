import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  const mumbai = await prisma.warehouse.create({
    data: { name: "Mumbai Hub", location: "Mumbai, MH" },
  });
  const delhi = await prisma.warehouse.create({
    data: { name: "Delhi Hub", location: "Delhi, DL" },
  });

  const shoe = await prisma.product.create({
    data: { name: "Nike Air Max 270", description: "Lightweight running shoe." },
  });
  const tshirt = await prisma.product.create({
    data: { name: "Adidas Originals Tee", description: "Classic cotton tee." },
  });
  const watch = await prisma.product.create({
    data: { name: "Casio G-Shock GA-100", description: "Shock-resistant watch." },
  });

  await prisma.inventory.createMany({
    data: [
      { productId: shoe.id,   warehouseId: mumbai.id, totalStock: 5,  reservedStock: 0 },
      { productId: shoe.id,   warehouseId: delhi.id,  totalStock: 3,  reservedStock: 0 },
      { productId: tshirt.id, warehouseId: mumbai.id, totalStock: 20, reservedStock: 0 },
      { productId: tshirt.id, warehouseId: delhi.id,  totalStock: 1,  reservedStock: 0 },
      { productId: watch.id,  warehouseId: mumbai.id, totalStock: 2,  reservedStock: 0 },
    ],
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());