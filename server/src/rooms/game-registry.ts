import type { ServerGameDef } from "./types.js";

export const SERVER_GAMES = new Map<string, ServerGameDef>();

export function registerServerGame<S, A>(def: ServerGameDef<S, A>): void {
  SERVER_GAMES.set(def.gameId, def as ServerGameDef);
}
