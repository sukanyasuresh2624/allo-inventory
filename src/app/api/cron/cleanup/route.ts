import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: new Date() },
    },
  });

  let released = 0;

  for (const reservation of expiredReservations) {
    await prisma.$transaction(async (tx) => {
      await tx.inventory.update({
        where: { id: reservation.inventoryId },
        data: { reservedStock: { decrement: reservation.quantity } },
      });
      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: "RELEASED" },
      });
    });
    released++;
  }

  return NextResponse.json({
    message: `Released ${released} expired reservation(s)`,
    released,
  });
}