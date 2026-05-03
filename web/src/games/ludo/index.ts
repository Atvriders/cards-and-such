import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LudoState, LudoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Ludo = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Ludo as unknown as React.ComponentType<unknown> })));
export const ludoSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "1" as const,
  },
} as const;

type LudoSettingsType = SettingsOf<typeof ludoSettings>;

export const ludoPlugin: GamePlugin<LudoState, LudoAction, typeof ludoSettings> = {
  id: "ludo",
  title: "Ludo",
  category: "board",
  players: { min: 1, max: 4, multiplayer: false },
  description: "Roll a single die, race your pawns home. Roll 6 to enter the board!",
  howToPlay: `Ludo is a classic board game for 2-4 players. You play as blue; bots control red, green, and orange. The goal is to be the first player to move all four of your pawns from the starting yard, around the 56-square track, and into the home position.

On your turn, click "Roll Die" to roll a single six-sided die. You must roll a 6 to bring a pawn out of the yard onto square 0. Once on the track, any pawn can be moved forward by the number rolled.

Rolling a 6 gives you an extra turn — use it wisely to bring another pawn out or push ahead. If you roll three 6s in a row, you lose your turn as a penalty.

Landing on an opponent's pawn on a non-safe square sends it back to their yard. Safe squares (0, 8, 14, 22, 28, 36, 42, 50) cannot be captured on, offering temporary shelter.

A pawn that reaches position 56 is safely home. The first player to get all four pawns home wins!

Bots play automatically: they prioritize using a 6 to bring pawns out of the yard, otherwise they advance their most backward pawn.`,
  settings: ludoSettings,
  initialState: (seed: number, settings: LudoSettingsType) => initialState(seed, settings),
  reducer, isTerminal, hint: (state: LudoState): HintTarget | null => (state.phase === "rolling" ? { selector: ".roll-btn", pulses: 3 } : null), component: Ludo,
};
