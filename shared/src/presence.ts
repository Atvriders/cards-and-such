import { z } from "zod";
import { UsernameSchema } from "./auth.js";

export const OnlineUserSchema = z.object({
  username: UsernameSchema,
  game: z.string().nullable(),
});
export type OnlineUser = z.infer<typeof OnlineUserSchema>;

export const PresenceMessageSchema = z.object({
  type: z.literal("presence"),
  online: z.number().int().nonnegative(),
  users: z.array(OnlineUserSchema),
});
export type PresenceMessage = z.infer<typeof PresenceMessageSchema>;
