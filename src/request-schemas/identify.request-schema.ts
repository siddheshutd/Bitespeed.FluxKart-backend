import { z } from 'zod';

export const IdentifyRequestSchema = z.object({
  email: z.string().email().optional(),
  phoneNumber: z.number().optional()
}).refine(
  (data) => data.email || data.phoneNumber,
  {
    message: "At least one of email or phoneNumber must be provided",
    path: ["email", "phoneNumber"]
  }
);

export type IdentifyRequestSchema = z.infer<typeof IdentifyRequestSchema>;