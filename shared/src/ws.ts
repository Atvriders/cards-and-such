import { z } from "zod";
import { PresenceMessageSchema } from "./presence.js";

export const WsAuthMessageSchema = z.object({
  type: z.literal("auth"),
  token: z.string().min(1),
});

export const WsSubscribeSchema = z.object({
  type: z.literal("subscribe"),
  channel: z.enum(["lobby"]),
});

export const WsClientMessageSchema = z.discriminatedUnion("type", [
  WsAuthMessageSchema,
  WsSubscribeSchema,
]);
export type WsClientMessage = z.infer<typeof WsClientMessageSchema>;

export const WsAuthOkSchema = z.object({ type: z.literal("auth_ok") });
export const WsErrorSchema = z.object({
  type: z.literal("error"),
  reason: z.string(),
});

export const WsServerMessageSchema = z.discriminatedUnion("type", [
  WsAuthOkSchema,
  PresenceMessageSchema,
  WsErrorSchema,
]);
export type WsServerMessage = z.infer<typeof WsServerMessageSchema>;
