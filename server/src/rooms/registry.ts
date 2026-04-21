import type { Seat, WsRoomStateMessage } from "@cards/shared";
import type { Room, Member, ServerGameDef } from "./types.js";
import { SERVER_GAMES } from "./game-registry.js";
import { randomBytes } from "node:crypto";

function roomId(): string {
  return randomBytes(6).toString("hex");
}

function roomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(4), (b) => alphabet[b % alphabet.length]!).join("");
}

export class RoomRegistry {
  private readonly byId = new Map<string, Room>();
  private readonly byCode = new Map<string, Room>();

  /** Create a room for the given gameId. Throws if the game isn't registered. */
  create(gameId: string): Room {
    const def = SERVER_GAMES.get(gameId);
    if (!def) throw new Error("unknown_game");
    const id = roomId();
    let code = roomCode();
    while (this.byCode.has(code)) code = roomCode();
    const seed = Math.floor(Math.random() * 2 ** 31);
    const room: Room = {
      id,
      code,
      def,
      state: def.initialState(seed, def.maxPlayers),
      members: [],
      phase: "waiting",
      terminal: null,
    };
    this.byId.set(id, room);
    this.byCode.set(code, room);
    return room;
  }

  byCodeLookup(code: string): Room | undefined {
    return this.byCode.get(code);
  }

  get(id: string): Room | undefined { return this.byId.get(id); }

  join(room: Room, username: string, socket: Member["socket"]): Member {
    if (room.members.some((m) => m.username === username)) {
      // Rejoin: return existing member with the new socket
      const m = room.members.find((x) => x.username === username)!;
      m.socket = socket;
      return m;
    }
    if (room.members.length >= room.def.maxPlayers) throw new Error("room_full");
    const takenSeats = new Set(room.members.map((m) => m.seat));
    let seat: Seat = 0;
    while (takenSeats.has(seat) && seat < 3) seat = (seat + 1) as Seat;
    const member: Member = { seat, username, socket };
    room.members.push(member);
    if (room.phase === "waiting" && room.members.length >= room.def.minPlayers) {
      room.phase = "playing";
    }
    return member;
  }

  leave(room: Room, username: string): void {
    room.members = room.members.filter((m) => m.username !== username);
    if (room.members.length === 0) {
      this.byId.delete(room.id);
      this.byCode.delete(room.code);
    }
  }

  dispatch(room: Room, username: string, action: unknown): void {
    const member = room.members.find((m) => m.username === username);
    if (!member) throw new Error("not_in_room");
    if (room.phase !== "playing") throw new Error("not_playing");
    const next = (room.def.reducer as (s: unknown, a: unknown, seat: Seat) => unknown)(
      room.state, action, member.seat,
    );
    room.state = next;
    const terminal = (room.def.isTerminal as (s: unknown) => { winner: Seat | "draw"; score: number } | null)(next);
    if (terminal) {
      room.phase = "ended";
      room.terminal = terminal;
    }
  }

  snapshot(room: Room, forRoomId: string): WsRoomStateMessage {
    return {
      type: "room-state",
      roomId: forRoomId,
      state: room.state,
      phase: room.phase,
      members: room.members.map((m) => ({ seat: m.seat, username: m.username })),
      terminal: room.terminal,
    };
  }

  broadcast(room: Room): void {
    const snap = this.snapshot(room, room.id);
    const wire = JSON.stringify(snap);
    for (const m of room.members) {
      if (m.socket.readyState === m.socket.OPEN) m.socket.send(wire);
    }
  }
}
