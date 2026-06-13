import { z } from "zod";

export const TRAVEL_TYPE_VALUES = ["local", "intercity", "airport", "package"] as const;

export const enquirySchema = z.object({
  car_id: z.string().uuid().nullable().optional(),
  car_model_snapshot: z.string().max(160).optional().nullable(),
  travel_type: z.enum(TRAVEL_TYPE_VALUES),
  full_name: z.string().trim().min(2, "Please enter your name").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[+0-9 ()-]+$/, "Only numbers, spaces and + - ( ) are allowed"),
  email: z.string().trim().email().max(160).optional().or(z.literal("")).transform((v) => (v ? v : null)),
  source_city: z.string().trim().max(120).optional().nullable(),
  destination_city: z.string().trim().max(120).optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  message: z.string().trim().max(1000).optional().nullable(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
