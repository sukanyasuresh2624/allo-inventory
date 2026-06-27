"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Package,
  CheckCircle,
} from "lucide-react";

type InventoryItem = {
  inventoryId: string;
  warehouseName: string;
  warehouseLocation: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  inventory: InventoryItem[];
};

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInv, setSelectedInv] = useState<string>(
    product.inventory[0]?.inventoryId ?? ""
  );

  const selected = product.inventory.find((i) => i.inventoryId === selectedInv);
  const totalAvailable = product.inventory.reduce((s, i) => s + i.availableStock, 0);

  async function handleReserve() {
    if (!selectedInv) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryId: selectedInv, quantity: 1 }),
      });

      if (res.status === 409) {
        setError("No stock left at this location. Try another warehouse.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const reservation = await res.json();
      router.push(`/reservation/${reservation.id}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const stockColor = (available: number, total: number) => {
    if (available === 0) return "text-red-400";
    if (available / total <= 0.3) return "text-amber-400";
    return "text-emerald-400";
  };

  const stockBarColor = (available: number, total: number) => {
    if (available === 0) return "bg-red-500";
    if (available / total <= 0.3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const stockLabel = (available: number) => {
    if (available === 0) return { text: "Out of Stock", cls: "bg-red-500/15 text-red-400 border-red-500/25" };
    if (available <= 3) return { text: "Low Stock", cls: "bg-amber-500/15 text-amber-400 border-amber-500/25" };
    return { text: "In Stock", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" };
  };

  const badge = stockLabel(totalAvailable);

  return (
    <div className="card-hover bg-slate-900 border border-white/8 rounded-2xl overflow-hidden flex flex-col group hover:border-indigo-500/30 transition-all duration-300">

      {/* ── Product Image ── */}
      <div className="relative h-52 bg-slate-800 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-14 h-14 text-white/10" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

        {/* Stock badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${badge.cls}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {badge.text}
          </span>
        </div>

        {/* Total stock pill */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-white/70 text-xs font-mono backdrop-blur-sm">
            <Package className="w-3 h-3" />
            {totalAvailable} left
          </span>
        </div>
      </div>

      {/* ── Product Info ── */}
      <div className="p-5 flex flex-col flex-1">

        {/* Name + description */}
        <div className="mb-4">
          <h3 className="text-white font-bold text-lg leading-tight mb-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* ── Warehouse Selector ── */}
        <div className="mb-4">
          <p className="text-white/35 text-xs uppercase tracking-widest font-medium mb-2 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            Select Warehouse
          </p>
          <div className="space-y-2">
            {product.inventory.map((inv) => {
              const pct = inv.totalStock > 0
                ? (inv.availableStock / inv.totalStock) * 100
                : 0;
              const isSelected = selectedInv === inv.inventoryId;

              return (
                <button
                  key={inv.inventoryId}
                  onClick={() => setSelectedInv(inv.inventoryId)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "border-indigo-500/60 bg-indigo-500/10 shadow-sm shadow-indigo-500/10"
                      : "border-white/6 bg-white/3 hover:border-white/14 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${
                        isSelected ? "bg-indigo-400" : "bg-white/20"
                      }`} />
                      <div>
                        <p className="text-white text-sm font-medium leading-tight">
                          {inv.warehouseName}
                        </p>
                        <p className="text-white/35 text-xs">{inv.warehouseLocation}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-mono font-bold ${stockColor(inv.availableStock, inv.totalStock)}`}>
                        {inv.availableStock}
                      </p>
                      <p className="text-white/25 text-xs">/{inv.totalStock}</p>
                    </div>
                  </div>

                  {/* Mini stock bar */}
                  <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stockBarColor(inv.availableStock, inv.totalStock)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Stock detail row */}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-white/25">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {inv.availableStock} avail
                    </span>
                    {inv.reservedStock > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {inv.reservedStock} reserved
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      {inv.totalStock} total
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-xs leading-relaxed">{error}</p>
          </div>
        )}

        {/* ── Reserve Button ── */}
        <div className="mt-auto pt-2">
          <button
            disabled={!selected || selected.availableStock === 0 || loading}
            onClick={handleReserve}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              !selected || selected.availableStock === 0
                ? "bg-white/4 text-white/20 cursor-not-allowed border border-white/6"
                : loading
                ? "bg-indigo-500/50 text-white/50 cursor-wait"
                : "bg-indigo-500 hover:bg-indigo-400 text-white glow-indigo cursor-pointer"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reserving...
              </>
            ) : !selected || selected.availableStock === 0 ? (
              <>
                <AlertCircle className="w-4 h-4" />
                Out of Stock
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Reserve · 10 min hold
              </>
            )}
          </button>
          <p className="text-center text-white/18 text-xs mt-2">
            Free cancellation · No payment required now
          </p>
        </div>
      </div>
    </div>
  );
}