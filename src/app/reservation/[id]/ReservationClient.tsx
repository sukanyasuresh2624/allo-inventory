"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCountdown } from "@/hooks/useCountdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  reservation: {
    id: string;
    status: string;
    quantity: number;
    expiresAt: string;
    productName: string;
    warehouseName: string;
    warehouseLocation: string;
  };
};

export default function ReservationClient({ reservation }: Props) {
  const router = useRouter();
  const { formatted, isExpired } = useCountdown(reservation.expiresAt);
  const [status, setStatus] = useState(reservation.status);
  const [loading, setLoading] = useState<"confirm" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading("confirm");
    setError(null);
    const res = await fetch(`/api/reservations/${reservation.id}/confirm`, {
      method: "POST",
    });
    if (res.status === 410) {
      setError("Reservation has expired. Please start over.");
      setStatus("RELEASED");
      setLoading(null);
      return;
    }
    if (!res.ok) {
      setError("Something went wrong.");
      setLoading(null);
      return;
    }
    setStatus("CONFIRMED");
    setLoading(null);
  }

  async function handleCancel() {
    setLoading("cancel");
    setError(null);
    const res = await fetch(`/api/reservations/${reservation.id}/release`, {
      method: "POST",
    });
    if (!res.ok) {
      setError("Something went wrong.");
      setLoading(null);
      return;
    }
    setStatus("RELEASED");
    setLoading(null);
  }

  const isDone = status === "CONFIRMED" || status === "RELEASED" || isExpired;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reservation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          <div className="space-y-1">
            <p className="text-lg font-semibold">{reservation.productName}</p>
            <p className="text-sm text-gray-500">
              {reservation.warehouseName} · {reservation.warehouseLocation}
            </p>
            <p className="text-sm text-gray-500">Quantity: {reservation.quantity}</p>
          </div>

          <div>
            <Badge
              variant={
                status === "CONFIRMED"
                  ? "default"
                  : status === "RELEASED" || isExpired
                  ? "destructive"
                  : "secondary"
              }
            >
              {status === "CONFIRMED"
                ? "✅ Confirmed"
                : status === "RELEASED"
                ? "❌ Cancelled"
                : isExpired
                ? "⏰ Expired"
                : "⏳ Pending"}
            </Badge>
          </div>

          {status === "PENDING" && (
            <div className="text-center bg-gray-100 rounded-lg py-4">
              {isExpired ? (
                <p className="text-red-500 font-semibold">Reservation expired</p>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-1">Time remaining</p>
                  <p className="text-4xl font-mono font-bold text-gray-800">
                    {formatted}
                  </p>
                </>
              )}
            </div>
          )}

          {status === "CONFIRMED" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-semibold">Payment confirmed!</p>
              <p className="text-green-600 text-sm mt-1">Your order has been placed.</p>
            </div>
          )}

          {(status === "RELEASED" || (isExpired && status !== "CONFIRMED")) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700 font-semibold">
                {isExpired ? "Reservation expired" : "Reservation cancelled"}
              </p>
              <p className="text-red-600 text-sm mt-1">
                Stock has been released back to inventory.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          {!isDone && (
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleConfirm} disabled={loading !== null}>
                {loading === "confirm" ? "Confirming..." : "Confirm Purchase"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={loading !== null}>
                {loading === "cancel" ? "Cancelling..." : "Cancel"}
              </Button>
            </div>
          )}

          <Button variant="ghost" className="w-full" onClick={() => router.push("/")}>
            ← Back to Products
          </Button>

        </CardContent>
      </Card>
    </main>
  );
}