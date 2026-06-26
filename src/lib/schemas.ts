import { z } from "zod";

export const ReserveSchema = z.object({
  inventoryId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const ConfirmReleaseSchema = z.object({
  id: z.string().min(1),
});