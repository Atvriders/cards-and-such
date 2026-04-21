import { WebSocketServer, type WebSocket } from "ws";
import type { FastifyInstance } from "fastify";
import {
  WsClientMessageSchema,
  type WsServerMessage,
} from "@cards/shared";
import { createJwt } from "../auth/jwt.js";
import { PresenceRegistry } from "./presence.js";
import type { RoomRegistry } from "../rooms/registry.js";

export interface WsClient { socket: WebSocket; username: string }
export interface WsHub { wss: WebSocketServer; presence: PresenceRegistry; }

export function attachWs(app: FastifyInstance, rooms: RoomRegistry): WsHub {
  const jwt = createJwt(app.config.JWT_SECRET);
  const wss = new WebSocketServer({ server: app.server, path: "/ws" });
  const clients = new Map<WebSocket, WsClient>();
  const presence = new PresenceRegistry();

  wss.on("connection", (socket) => {
    const authTimer = setTimeout(() => {
      sendError(socket, "auth_timeout");
      socket.close(1008, "auth_timeout");
    }, 5000);

    socket.on("message", async (raw) => {
      let parsed;
      try { parsed = WsClientMessageSchema.parse(JSON.parse(raw.toString())); }
      catch { return sendError(socket, "bad_message"); }

      if (parsed.type === "auth") {
        try {
          const claims = await jwt.verify(parsed.token);
          clearTimeout(authTimer);
          clients.set(socket, { socket, username: claims.sub });
          presence.add({ socket, username: claims.sub, game: null });
          send(socket, { type: "auth_ok" });
        } catch {
          sendError(socket, "bad_token");
          socket.close(1008, "bad_token");
        }
        return;
      }

      const client = clients.get(socket);
      if (!client) return sendError(socket, "not_authenticated");

      if (parsed.type === "subscribe" && parsed.channel === "lobby") {
        presence.subscribeLobby(socket);
        return;
      }

      if (parsed.type === "room-join") {
        const room = rooms.get(parsed.roomId);
        if (!room) return sendError(socket, "room_not_found");
        try {
          const member = rooms.join(room, client.username, socket);
          send(socket, { type: "room-joined", roomId: room.id, seat: member.seat });
          rooms.broadcast(room);
        } catch (e) {
          sendError(socket, (e as Error).message);
        }
        return;
      }

      if (parsed.type === "room-action") {
        const room = rooms.get(parsed.roomId);
        if (!room) return sendError(socket, "room_not_found");
        try {
          rooms.dispatch(room, client.username, parsed.action);
          rooms.broadcast(room);
        } catch (e) {
          sendError(socket, (e as Error).message);
        }
        return;
      }

      if (parsed.type === "room-leave") {
        const room = rooms.get(parsed.roomId);
        if (!room) return;
        rooms.leave(room, client.username);
        send(socket, { type: "room-left", roomId: parsed.roomId });
        rooms.broadcast(room);
        return;
      }
    });

    socket.on("close", () => {
      clearTimeout(authTimer);
      const client = clients.get(socket);
      if (client) {
        presence.remove(client.username);
        clients.delete(socket);
      }
      presence.unsubscribeLobby(socket);
    });
  });

  app.addHook("onClose", () => new Promise<void>((r) => wss.close(() => r())));
  return { wss, presence };
}

function send(socket: WebSocket, msg: WsServerMessage): void {
  socket.send(JSON.stringify(msg));
}
function sendError(socket: WebSocket, reason: string): void {
  send(socket, { type: "error", reason });
}
