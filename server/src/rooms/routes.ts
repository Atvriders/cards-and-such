import type { FastifyInstance } from "fastify";
import { CreateRoomRequestSchema, JoinRoomRequestSchema } from "@cards/shared";
import { createJwt } from "../auth/jwt.js";
import { RoomRegistry } from "./registry.js";

export async function registerRoomsRoutes(app: FastifyInstance, registry: RoomRegistry): Promise<void> {
  const jwt = createJwt(app.config.JWT_SECRET);

  function requireAuth(req: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply): Promise<string | null> {
    const auth = req.headers.authorization ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) { void reply.code(401).send({ error: "missing_token" }); return Promise.resolve(null); }
    return jwt.verify(token).then((c) => c.sub).catch(() => {
      void reply.code(401).send({ error: "bad_token" });
      return null;
    });
  }

  app.post("/rooms", async (req, reply) => {
    const username = await requireAuth(req, reply);
    if (!username) return;
    const parsed = CreateRoomRequestSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request" });
    try {
      const room = registry.create(parsed.data.gameId);
      return {
        room: {
          id: room.id,
          code: room.code,
          gameId: parsed.data.gameId,
          members: room.members.map((m) => ({ seat: m.seat, username: m.username })),
          min: room.def.minPlayers,
          max: room.def.maxPlayers,
          phase: room.phase,
        },
        seat: 0,
      };
    } catch (e) {
      return reply.code(400).send({ error: (e as Error).message });
    }
  });

  app.post("/rooms/join", async (req, reply) => {
    const username = await requireAuth(req, reply);
    if (!username) return;
    const parsed = JoinRoomRequestSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request" });
    const room = registry.byCodeLookup(parsed.data.code);
    if (!room) return reply.code(404).send({ error: "room_not_found" });
    return {
      room: {
        id: room.id,
        code: room.code,
        gameId: room.def.gameId,
        members: room.members.map((m) => ({ seat: m.seat, username: m.username })),
        min: room.def.minPlayers,
        max: room.def.maxPlayers,
        phase: room.phase,
      },
    };
  });

  app.get<{ Params: { id: string } }>("/rooms/:id", async (req, reply) => {
    const room = registry.get(req.params.id);
    if (!room) return reply.code(404).send({ error: "room_not_found" });
    return {
      id: room.id,
      code: room.code,
      gameId: room.def.gameId,
      members: room.members.map((m) => ({ seat: m.seat, username: m.username })),
      min: room.def.minPlayers,
      max: room.def.maxPlayers,
      phase: room.phase,
    };
  });
}
