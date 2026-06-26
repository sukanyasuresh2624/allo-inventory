import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      inventory: {
        include: { warehouse: true },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    inventory: p.inventory.map((inv) => ({
      inventoryId: inv.id,
      warehouseId: inv.warehouseId,
      warehouseName: inv.warehouse.name,
      warehouseLocation: inv.warehouse.location,
      totalStock: inv.totalStock,
      reservedStock: inv.reservedStock,
      availableStock: inv.totalStock - inv.reservedStock,
    })),
  }));
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Allo Inventory</h1>
          <p className="text-gray-500 mt-1">
            Browse products and reserve stock across warehouses.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}