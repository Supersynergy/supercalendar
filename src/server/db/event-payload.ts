import { z } from "zod";

// Validation for the events API body. Independent from the form schema (which
// uses Date objects + split time); the wire format is ISO strings + userId.
export const eventPayloadSchema = z.object({
  title: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  color: z.enum(["blue", "green", "red", "yellow", "purple", "orange", "gray"]),
  description: z.string(),
  userId: z.string().min(1),
});

export type TEventPayload = z.infer<typeof eventPayloadSchema>;
