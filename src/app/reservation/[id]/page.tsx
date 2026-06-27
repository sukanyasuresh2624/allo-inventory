import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReservationClient from "./ReservationClient";

export const revalidate = 0;

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      inventory: {
        include: {
          product: true,
          warehouse: true,
        },
      },
    },
  });

  if (!reservation) notFound();

  return (
    <ReservationClient
      reservation={{
        id: reservation.id,
        status: reservation.status,
        quantity: reservation.quantity,
        expiresAt: reservation.expiresAt.toISOString(),
        productName: reservation.inventory.product.name,
        productImage: reservation.inventory.product.imageUrl ?? null,
        warehouseName: reservation.inventory.warehouse.name,
        warehouseLocation: reservation.inventory.warehouse.location,
      }}
    />
  );
}