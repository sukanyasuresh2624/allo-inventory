import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Idempotency key support (bonus)
  const idempotencyKey = req.headers.get("Idempotency-Key");
  if (idempotencyKey) {
    const existing = await prisma.reservation.findUnique({
      where: { idempotencyKey },
    });
    if (existing?.status === "CONFIRMED") {
      return NextResponse.json(existing, { status: 200 });
    }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id } });

      if (!reservation) throw new Error("NOT_FOUND");
      if (reservation.status !== "PENDING") throw new Error("NOT_PENDING");
      if (reservation.expiresAt < new Date()) throw new Error("EXPIRED");

      // Decrement reservedStock and totalStock (permanent sale)
      await tx.inventory.update({
        where: { id: reservation.inventoryId },
        data: {
          reservedStock: { decrement: reservation.quantity },
          totalStock: { decrement: reservation.quantity },
        },
      });

      return tx.reservation.update({
        where: { id },
        data: { status: "CONFIRMED" },
      });
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message === "NOT_FOUND") {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }
    if (message === "EXPIRED") {
      return NextResponse.json({ error: "Reservation has expired" }, { status: 410 });
    }
    if (message === "NOT_PENDING") {
      return NextResponse.json({ error: "Reservation is not pending" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}