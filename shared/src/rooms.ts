import { z } from "zod";
import { GameIdSchema } from "./leaderboard.js";
import { UsernameSchema } from "./auth.js";

export const RoomIdSchema = z.string().regex(/^[a-z0-9]{12}$/);
export type RoomId = z.infer<typeof RoomIdSchema>;

export const RoomCodeSchema = z.string().regex(/^[A-Z0-9]{4}$/);
export type RoomCode = z.infer<typeof RoomCodeSchema>;

export const SeatSchema = z.number().int().min(0).max(3);
export type Seat = z.infer<typeof SeatSchema>;

export const RoomInfoSchema = z.object({
  id: RoomIdSchema,
  code: RoomCodeSchema,
  gameId: GameIdSchema,
  members: z.array(z.object({
    seat: SeatSchema,
    username: UsernameSchema,
  })),
  min: z.number().int().positive(),
  max: z.number().int().positive(),
  phase: z.enum(["waiting", "playing", "ended"]),
});
export type RoomInfo = z.infer<typeof RoomInfoSchema>;

export const CreateRoomRequestSchema = z.object({ gameId: GameIdSchema });
export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;

export const CreateRoomResponseSchema = z.object({
  room: RoomInfoSchema,
  seat: SeatSchema,
});
export type CreateRoomResponse = z.infer<typeof CreateRoomResponseSchema>;

export const JoinRoomRequestSchema = z.object({
  code: RoomCodeSchema,
});
export type JoinRoomRequest = z.infer<typeof JoinRoomRequestSchema>;

/* ------- WS messages ------- */

export const WsRoomJoinSchema = z.object({
  type: z.literal("room-join"),
  roomId: RoomIdSchema,
});

export const WsRoomActionSchema = z.object({
  type: z.literal("room-action"),
  roomId: RoomIdSchema,
  action: z.unknown(), // opaque game-specific action; validated by the reducer
});

export const WsRoomLeaveSchema = z.object({
  type: z.literal("room-leave"),
  roomId: RoomIdSchema,
});

export const WsRoomStateSchema = z.object({
  type: z.literal("room-state"),
  roomId: RoomIdSchema,
  state: z.unknown(),
  phase: z.enum(["waiting", "playing", "ended"]),
  members: z.array(z.object({ seat: SeatSchema, username: UsernameSchema })),
  terminal: z.object({ winner: z.union([SeatSchema, z.literal("draw")]), score: z.number().int() }).nullable(),
});
export type WsRoomStateMessage = z.infer<typeof WsRoomStateSchema>;

export const WsRoomJoinedSchema = z.object({
  type: z.literal("room-joined"),
  roomId: RoomIdSchema,
  seat: SeatSchema,
});

export const WsRoomLeftSchema = z.object({
  type: z.literal("room-left"),
  roomId: RoomIdSchema,
});
