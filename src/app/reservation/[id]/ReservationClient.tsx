"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCountdown } from "@/hooks/useCountdown";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  MapPin,
  Package,
  ShoppingBag,
  Timer,
} from "lucide-react";

type Props = {
  reservation: {
    id: string;
    status: string;
    quantity: number;
    expiresAt: string;
    productName: string;
    productImage: string | null;
    warehouseName: string;
    warehouseLocation: string;
  };
};

export default function ReservationClient({ reservation }: Props) {
  const router = useRouter();
  const { formatted, isExpired, secondsLeft } = useCountdown(reservation.expiresAt);
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
      setError("This reservation expired before payment was completed.");
      setStatus("RELEASED");
      setLoading(null);
      return;
    }
    if (!res.ok) {
      setError("Something went wrong. Please try again.");
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
      setError("Something went wrong. Please try again.");
      setLoading(null);
      return;
    }
    setStatus("RELEASED");
    setLoading(null);
  }

  const isDone = status === "CONFIRMED" || status === "RELEASED" || isExpired;

  // Timer colors based on time left
  const totalSeconds = 10 * 60;
  const pct = Math.max(0, (secondsLeft / totalSeconds) * 100);
  const timerColor =
    secondsLeft > 300 ? "text-emerald-400" :
    secondsLeft > 120 ? "text-amber-400" :
    "text-red-400";
  const timerBarColor =
    secondsLeft > 300 ? "bg-emerald-500" :
    secondsLeft > 120 ? "bg-amber-500" :
    "bg-red-500";
  const timerBorder =
    secondsLeft > 300 ? "border-emerald-500/25 bg-emerald-500/8" :
    secondsLeft > 120 ? "border-amber-500/25 bg-amber-500/8" :
    "border-red-500/25 bg-red-500/8";

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── Top bar ── */}
      <div className="border-b border-white/6 bg-slate-950/90 backdrop-blur sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Back to Products</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <Timer className="w-4 h-4" />
            <span>Reservation</span>
            <span className="font-mono text-xs text-white/20">#{reservation.id.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: Product info ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Product image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-white/8">
              {reservation.productImage ? (
                <Image
                  src={reservation.productImage}
                  alt={reservation.productName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-white/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
            </div>

            {/* Product details card */}
            <div className="bg-slate-900 border border-white/8 rounded-2xl p-4 space-y-3">
              <div>
                <p className="text-white/35 text-xs uppercase tracking-widest mb-1">Product</p>
                <p className="text-white font-bold text-lg leading-tight">{reservation.productName}</p>
              </div>
              <div className="h-px bg-white/6" />
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{reservation.warehouseName}</p>
                  <p className="text-white/40 text-xs">{reservation.warehouseLocation}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-white/30" />
                <p className="text-white/60 text-sm">Quantity: <span className="text-white font-mono font-bold">{reservation.quantity}</span></p>
              </div>
            </div>
          </div>

          {/* ── Right: Status + actions ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Status banner */}
            {status === "CONFIRMED" && (
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-300 font-bold text-lg">Order Confirmed!</p>
                  <p className="text-emerald-400/60 text-sm mt-1">
                    Your purchase is complete. Stock has been permanently allocated to this order.
                  </p>
                </div>
              </div>
            )}

            {(status === "RELEASED" || (isExpired && status !== "CONFIRMED")) && (
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/25">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-red-300 font-bold text-lg">
                    {isExpired && status !== "RELEASED" ? "Reservation Expired" : "Reservation Cancelled"}
                  </p>
                  <p className="text-red-400/60 text-sm mt-1">
                    Stock has been released back to inventory and is now available to other shoppers.
                  </p>
                </div>
              </div>
            )}

            {/* Timer card */}
            {status === "PENDING" && (
              <div className={`rounded-2xl border p-6 ${isExpired ? "border-red-500/25 bg-red-500/8" : timerBorder}`}>
                {isExpired ? (
                  <div className="text-center py-4">
                    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <p className="text-red-300 font-bold text-xl">Time's Up</p>
                    <p className="text-red-400/50 text-sm mt-1">
                      The 10-minute reservation window has closed.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className={`w-5 h-5 ${timerColor}`} />
                        <span className="text-white/50 text-sm font-medium">Time Remaining</span>
                      </div>
                      <span className={`font-mono font-bold text-4xl tracking-tight ${timerColor}`}>
                        {formatted}
                      </span>
                    </div>
                    <div className="h-2 bg-white/8 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${timerBarColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-white/25 text-xs">
                      This stock is held exclusively for you. Complete your purchase before the timer expires.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Reservation info card */}
            <div className="bg-slate-900 border border-white/8 rounded-2xl p-5">
              <p className="text-white/35 text-xs uppercase tracking-widest mb-4 font-medium">Reservation Details</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Reservation ID</span>
                  <span className="text-white font-mono text-sm">#{reservation.id.slice(-12).toUpperCase()}</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Status</span>
                  <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full border ${
                    status === "CONFIRMED"
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                      : status === "RELEASED" || isExpired
                      ? "text-red-400 bg-red-500/10 border-red-500/25"
                      : "text-amber-400 bg-amber-500/10 border-amber-500/25"
                  }`}>
                    {status === "CONFIRMED" ? "✓ Confirmed" :
                     status === "RELEASED" ? "✕ Released" :
                     isExpired ? "⏰ Expired" : "⏳ Pending"}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Hold expires</span>
                  <span className="text-white/60 text-sm font-mono">
                    {new Date(reservation.expiresAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Action buttons */}
            {!isDone && (
              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={loading !== null}
                  className="flex-1 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/30 disabled:text-white/30 text-white font-semibold text-sm transition-all glow-indigo flex items-center justify-center gap-2"
                >
                  {loading === "confirm" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Confirm Purchase</>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading !== null}
                  className="flex-1 py-3.5 rounded-xl bg-white/6 hover:bg-white/10 disabled:opacity-30 text-white/70 hover:text-white font-semibold text-sm transition-all border border-white/8 flex items-center justify-center gap-2"
                >
                  {loading === "cancel" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> Cancel Reservation</>
                  )}
                </button>
              </div>
            )}

            {isDone && (
              <button
                onClick={() => router.push("/")}
                className="w-full py-3.5 rounded-xl bg-white/6 hover:bg-white/10 text-white/60 hover:text-white font-semibold text-sm transition-all border border-white/8 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Browse More Products
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}