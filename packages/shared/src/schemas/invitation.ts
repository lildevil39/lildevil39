import { z } from "zod";
import { ATTENDANCE, LOCALES } from "../enums";

export const weddingEventSchema = z.object({
  title: z.string().min(1),
  startsAt: z.string().datetime().optional(),
  timeLabel: z.string().optional(),
  note: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const weddingInvitationSchema = z.object({
  brideName: z.string().min(1),
  groomName: z.string().min(1),
  weddingDate: z.string().datetime(),
  weddingTime: z.string().optional(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  mapsUrl: z.string().url().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  dressCode: z.string().optional(),
  notes: z.string().optional(),
  locale: z.enum(LOCALES).default("FR"),
  messageFr: z.string().optional(),
  messageEn: z.string().optional(),
  messageAr: z.string().optional(),
  musicId: z.string().cuid().optional(),
  rsvpEnabled: z.boolean().default(true),
  rsvpDeadline: z.string().datetime().optional(),
  wishesEnabled: z.boolean().default(true),
  countdownEnabled: z.boolean().default(true),
});
export type WeddingInvitationDto = z.infer<typeof weddingInvitationSchema>;

/** honeypot field must stay empty; server rejects silently if filled */
export const rsvpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  guests: z.number().int().min(1).default(1),
  attendance: z.enum(ATTENDANCE),
  message: z.string().optional(),
  company: z.string().max(0).optional(), // honeypot
});
export type RsvpDto = z.infer<typeof rsvpSchema>;

export const wishSchema = z.object({
  name: z.string().min(1),
  message: z.string().min(1).max(500),
  company: z.string().max(0).optional(), // honeypot
});
export type WishDto = z.infer<typeof wishSchema>;
