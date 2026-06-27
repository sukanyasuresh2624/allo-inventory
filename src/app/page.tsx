import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { Package, Warehouse, TrendingUp, Boxes } from "lucide-react";

export const revalidate = 0;

async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      inventory: { include: { warehouse: true } },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
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

  const totalAvailable = products.reduce(
    (sum, p) => sum + p.inventory.reduce((s, i) => s + i.availableStock, 0), 0
  );
  const totalReserved = products.reduce(
    (sum, p) => sum + p.inventory.reduce((s, i) => s + i.reservedStock, 0), 0
  );
  const totalWarehouses = new Set(
    products.flatMap((p) => p.inventory.map((i) => i.warehouseId))
  ).size;

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── Hero ── */}
      <section className="relative border-b border-white/6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Multi-Warehouse Inventory System
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
              Reserve products
              <span className="block text-indigo-400">before they're gone.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Browse live inventory across {totalWarehouses} warehouses. Reserve any item for 10 minutes while you complete checkout — guaranteed with zero race conditions.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
            <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-white/40 text-xs uppercase tracking-widest">Available</span>
              </div>
              <p className="text-3xl font-mono font-bold text-white">{totalAvailable}</p>
              <p className="text-white/25 text-xs mt-1">units ready to ship</p>
            </div>

            <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span className="text-white/40 text-xs uppercase tracking-widest">Reserved</span>
              </div>
              <p className="text-3xl font-mono font-bold text-white">{totalReserved}</p>
              <p className="text-white/25 text-xs mt-1">units in checkout</p>
            </div>

            <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Warehouse className="w-4 h-4 text-violet-400" />
                <span className="text-white/40 text-xs uppercase tracking-widest">Warehouses</span>
              </div>
              <p className="text-3xl font-mono font-bold text-white">{totalWarehouses}</p>
              <p className="text-white/25 text-xs mt-1">fulfilment centers</p>
            </div>

            <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Boxes className="w-4 h-4 text-blue-400" />
                <span className="text-white/40 text-xs uppercase tracking-widest">Products</span>
              </div>
              <p className="text-3xl font-mono font-bold text-white">{products.length}</p>
              <p className="text-white/25 text-xs mt-1">items in catalogue</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-white font-bold text-2xl">All Products</h2>
            <p className="text-white/40 text-sm mt-1">
              Select a warehouse and click Reserve to hold stock for 10 minutes.
            </p>
          </div>
          <span className="hidden sm:block text-white/20 text-sm font-mono">
            {products.length} items
          </span>
        </div>

        {products.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-6">
              <Boxes className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-white font-semibold text-xl mb-2">No Products Available</h3>
            <p className="text-white/40 text-sm max-w-sm">
              No products have been added to the inventory yet. Run the seed script to populate the database.
            </p>
            <code className="mt-4 px-4 py-2 rounded-lg bg-white/4 border border-white/8 text-indigo-400 text-sm font-mono">
              npx prisma db seed
            </code>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}