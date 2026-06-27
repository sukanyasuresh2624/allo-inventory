import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  // --- Warehouses with professional names ---
  const bengaluru = await prisma.warehouse.create({
    data: { name: "Bengaluru Distribution Center", location: "Bengaluru, KA" },
  });
  const mumbai = await prisma.warehouse.create({
    data: { name: "Mumbai Central Warehouse", location: "Mumbai, MH" },
  });
  const delhi = await prisma.warehouse.create({
    data: { name: "Delhi Logistics Hub", location: "Delhi, DL" },
  });

  // --- Products with real Unsplash images ---
  const shoe = await prisma.product.create({
    data: {
      name: "Nike Air Max 270",
      description: "Lightweight running shoe with Max Air cushioning for all-day comfort.",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    },
  });

  const tshirt = await prisma.product.create({
    data: {
      name: "Adidas Originals Tee",
      description: "Classic cotton tee with iconic trefoil logo. Available in multiple colors.",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    },
  });

  const watch = await prisma.product.create({
    data: {
      name: "Casio G-Shock GA-100",
      description: "Shock-resistant digital watch with world time and LED backlight.",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    },
  });

  const bag = await prisma.product.create({
    data: {
      name: "Leather Messenger Bag",
      description: "Premium full-grain leather bag with padded laptop compartment.",
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    },
  });

  const headphones = await prisma.product.create({
    data: {
      name: "Sony WH-1000XM5",
      description: "Industry-leading noise cancelling wireless headphones with 30hr battery.",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    },
  });

  const sunglasses = await prisma.product.create({
    data: {
      name: "Ray-Ban Aviator Classic",
      description: "Iconic aviator sunglasses with UV400 protection and metal frame.",
      imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
    },
  });

  // --- Inventory per product per warehouse ---
  await prisma.inventory.createMany({
    data: [
      // Nike shoe
      { productId: shoe.id, warehouseId: bengaluru.id, totalStock: 8,  reservedStock: 0 },
      { productId: shoe.id, warehouseId: mumbai.id,    totalStock: 5,  reservedStock: 0 },
      { productId: shoe.id, warehouseId: delhi.id,     totalStock: 3,  reservedStock: 0 },
      // Adidas tee
      { productId: tshirt.id, warehouseId: bengaluru.id, totalStock: 25, reservedStock: 0 },
      { productId: tshirt.id, warehouseId: mumbai.id,    totalStock: 20, reservedStock: 0 },
      { productId: tshirt.id, warehouseId: delhi.id,     totalStock: 1,  reservedStock: 0 },
      // G-Shock
      { productId: watch.id, warehouseId: bengaluru.id, totalStock: 4,  reservedStock: 0 },
      { productId: watch.id, warehouseId: mumbai.id,    totalStock: 2,  reservedStock: 0 },
      // Leather Bag
      { productId: bag.id, warehouseId: bengaluru.id, totalStock: 6,  reservedStock: 0 },
      { productId: bag.id, warehouseId: delhi.id,     totalStock: 3,  reservedStock: 0 },
      // Sony headphones
      { productId: headphones.id, warehouseId: bengaluru.id, totalStock: 5,  reservedStock: 0 },
      { productId: headphones.id, warehouseId: mumbai.id,    totalStock: 2,  reservedStock: 0 },
      // Ray-Ban
      { productId: sunglasses.id, warehouseId: mumbai.id, totalStock: 7,  reservedStock: 0 },
      { productId: sunglasses.id, warehouseId: delhi.id,  totalStock: 1,  reservedStock: 0 },
    ],
  });

  console.log("✅ Seed complete — 6 products, 3 warehouses");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());