import { WebSocketServer, type WebSocket } from "ws";
import type { FastifyInstance } from "fastify";
import {
  WsClientMessageSchema,
  type WsServerMessage,
} from "@cards/shared";
import { createJwt } from "../auth/jwt.js";

export interface WsClient { socket: WebSocket; username: string }
export interface WsHub { wss: WebSocketServer; clients: Map<WebSocket, WsClient>; }

export function attachWs(app: FastifyInstance): WsHub {
  const jwt = createJwt(app.config.JWT_SECRET);
  const wss = new WebSocketServer({ server: app.server, path: "/ws" });
  const clients = new Map<WebSocket, WsClient>();

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
          send(socket, { type: "auth_ok" });
        } catch {
          sendError(socket, "bad_token");
          socket.close(1008, "bad_token");
        }
        return;
      }

      if (!clients.has(socket)) return sendError(socket, "not_authenticated");
      // subscribe handled in Task 9.
    });

    socket.on("close", () => {
      clearTimeout(authTimer);
      clients.delete(socket);
    });
  });

  return { wss, clients };
}

function send(socket: WebSocket, msg: WsServerMessage): void {
  socket.send(JSON.stringify(msg));
}
function sendError(socket: WebSocket, reason: string): void {
  send(socket, { type: "error", reason });
}
