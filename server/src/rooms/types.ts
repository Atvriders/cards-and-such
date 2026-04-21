import type { RoomId, RoomCode, Seat } from "@cards/shared";
import type { WebSocket } from "ws";

export interface Member { seat: Seat; username: string; socket: WebSocket }

export interface ServerGameDef<S = unknown, A = unknown> {
  gameId: string;
  minPlayers: number;
  maxPlayers: number;
  initialState(seed: number, seats: number): S;
  reducer(state: S, action: A, seat: Seat): S;
  isTerminal(state: S): { winner: Seat | "draw"; score: number } | null;
}

export interface Room<S = unknown, A = unknown> {
  id: RoomId;
  code: RoomCode;
  def: ServerGameDef<S, A>;
  state: S;
  members: Member[];
  phase: "waiting" | "playing" | "ended";
  terminal: { winner: Seat | "draw"; score: number } | null;
}
