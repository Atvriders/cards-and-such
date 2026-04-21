import {
  CreateRoomRequestSchema,
  JoinRoomRequestSchema,
  RoomInfoSchema,
  type RoomInfo,
  type RoomCode,
  type Seat,
} from "@cards/shared";
import { useAuth } from "../stores/auth.js";
import { z } from "zod";

const CreateResponseSchema = z.object({
  room: RoomInfoSchema,
  seat: z.number().int().min(0).max(3),
});

async function authed<T>(url: string, body: unknown, schema: { parse(v: unknown): T }): Promise<T> {
  const token = useAuth.getState().token;
  if (!token) throw new Error("not_authenticated");
  const res = await fetch(`/api${url}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `http_${res.status}` }));
    throw new Error((err as { error?: string }).error ?? `http_${res.status}`);
  }
  return schema.parse(await res.json());
}

export async function createRoom(gameId: string): Promise<{ room: RoomInfo; seat: Seat }> {
  CreateRoomRequestSchema.parse({ gameId });
  return authed("/rooms", { gameId }, CreateResponseSchema);
}

export async function joinRoomByCode(code: RoomCode): Promise<{ room: RoomInfo }> {
  JoinRoomRequestSchema.parse({ code });
  return authed("/rooms/join", { code }, z.object({ room: RoomInfoSchema }));
}
