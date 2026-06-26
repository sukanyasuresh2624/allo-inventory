"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type InventoryItem = {
  inventoryId: string;
  warehouseName: string;
  warehouseLocation: string;
  availableStock: number;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  inventory: InventoryItem[];
};

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReserve(inventoryId: string) {
    setLoading(inventoryId);
    setError(null);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryId, quantity: 1 }),
      });

      if (res.status === 409) {
        setError("Not enough stock available.");
        return;
      }

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }

      const reservation = await res.json();
      router.push(`/reservation/${reservation.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
        {product.description && (
          <p className="text-sm text-gray-500">{product.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <p className="text-sm text-red-500 font-medium">{error}</p>
        )}
        {product.inventory.map((inv) => (
          <div
            key={inv.inventoryId}
            className="flex items-center justify-between border rounded-md p-3"
          >
            <div>
              <p className="text-sm font-medium">{inv.warehouseName}</p>
              <p className="text-xs text-gray-400">{inv.warehouseLocation}</p>
              <Badge
                variant={inv.availableStock > 0 ? "default" : "destructive"}
                className="mt-1"
              >
                {inv.availableStock > 0
                  ? `${inv.availableStock} available`
                  : "Out of stock"}
              </Badge>
            </div>
            <Button
              size="sm"
              disabled={inv.availableStock === 0 || loading === inv.inventoryId}
              onClick={() => handleReserve(inv.inventoryId)}
            >
              {loading === inv.inventoryId ? "Reserving..." : "Reserve"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}