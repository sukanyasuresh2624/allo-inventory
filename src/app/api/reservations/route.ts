import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReserveSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ReserveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { inventoryId, quantity } = parsed.data;

  const idempotencyKey = req.headers.get("Idempotency-Key");
  if (idempotencyKey) {
    const existing = await prisma.reservation.findUnique({
      where: { idempotencyKey },
    });
    if (existing) return NextResponse.json(existing, { status: 200 });
  }

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      const inventory = await tx.$queryRaw<
  {
    id: string;
    totalStock: number;
    reservedStock: number;
  }[]
>`
SELECT id, "totalStock", "reservedStock"
FROM "Inventory"
WHERE id = ${inventoryId}
FOR UPDATE
`;
      if (!inventory.length) throw new Error("NOT_FOUND");

      const inv = inventory[0];
      const available = inv.totalStock - inv.reservedStock;

      if (available < quantity) throw new Error("INSUFFICIENT_STOCK");

      await tx.inventory.update({
        where: { id: inventoryId },
        data: { reservedStock: { increment: quantity } },
      });

      return tx.reservation.create({
        data: {
          inventoryId,
          quantity,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          ...(idempotencyKey ? { idempotencyKey } : {}),
        },
      });
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message === "INSUFFICIENT_STOCK") {
      return NextResponse.json({ error: "Not enough stock available" }, { status: 409 });
    }
    if (message === "NOT_FOUND") {
      return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}