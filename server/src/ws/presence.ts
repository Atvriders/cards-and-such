import type { WebSocket } from "ws";
import type { PresenceMessage, WsServerMessage } from "@cards/shared";

export interface PresenceEntry {
  socket: WebSocket;
  username: string;
  game: string | null;
}

export class PresenceRegistry {
  private readonly byUser = new Map<string, PresenceEntry>();
  private readonly lobbySubscribers = new Set<WebSocket>();
  private pending: NodeJS.Timeout | null = null;
  private readonly debounceMs = 500;

  add(entry: PresenceEntry): void {
    this.byUser.set(entry.username, entry);
    this.schedule();
  }

  remove(username: string): void {
    this.byUser.delete(username);
    this.schedule();
  }

  subscribeLobby(socket: WebSocket): void {
    this.lobbySubscribers.add(socket);
    this.sendTo(socket);
  }

  unsubscribeLobby(socket: WebSocket): void {
    this.lobbySubscribers.delete(socket);
  }

  private schedule(): void {
    if (this.pending) return;
    this.pending = setTimeout(() => {
      this.pending = null;
      this.lobbySubscribers.forEach((s) => this.sendTo(s));
    }, this.debounceMs);
  }

  private sendTo(socket: WebSocket): void {
    const msg: PresenceMessage = {
      type: "presence",
      online: this.byUser.size,
      users: [...this.byUser.values()].map((e) => ({
        username: e.username,
        game: e.game,
      })),
    };
    const wire: WsServerMessage = msg;
    socket.send(JSON.stringify(wire));
  }
}
