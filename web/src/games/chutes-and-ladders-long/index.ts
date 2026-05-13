import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LongState, LongAction, LongSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const ChutesLongGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.ChutesLongGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "(no settings)", default: false },
} as const;
type S = SettingsOf<typeof settings>;

export const chutesAndLaddersLongPlugin: GamePlugin<LongState, LongAction, typeof settings> = {
  id: "chutes-and-ladders-long",
  title: "Chutes and Ladders (Long Edition)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "The full nostalgia trip — extended board, 4 pawns per player, and pile-up rules at chute heads.",
  howToPlay:
    "Long Edition stretches the classic Chutes and Ladders out into a marathon. " +
    "The main board is the standard 10x10 (squares 1 through 100), but reaching 100 doesn't end the race — " +
    "a 10-square Bonus Track (squares 101 through 110) unlocks. One last ladder at 101 jumps you to 105 " +
    "and one last chute at 109 drops you back to 95. Square 110 is home.\n\n" +
    "Each player runs four pawns and must shepherd ALL FOUR into 110 to win. On every turn you roll one d6, " +
    "then choose which of your pawns to advance. Overshooting 110 is illegal — you must land exactly. " +
    "If every legal move would land your chosen pawn on a chute head, the forced-move rule kicks in and you must " +
    "advance your leading (furthest-along) pawn instead of stalling.\n\n" +
    "PILE-UP RULE: chute heads get crowded. If exactly one pawn is sitting on a chute head and a second pawn " +
    "arrives, the newcomer SHOVES the original down the chute. The arriving pawn stays on the head. Use it " +
    "offensively against the CPUs, or pray it never happens to you.\n\n" +
    "You play against 3 CPU opponents, each of whom uses a catch-up heuristic — they always advance their " +
    "laggiest pawn. Scoring: if you win, you score 100 plus 50 for each of your pawns at home (always 4 if you " +
    "won, so 300). Losing scores 0.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as LongSettings),
  reducer,
  isTerminal,
  hint: (s) => {
    if (isTerminal(s)) return null;
    if (s.phase === "rolling" && s.turn === 0) {
      return { selector: '[data-testid="cll-roll"]', pulses: 3 };
    }
    if (s.phase === "moving" && s.turn === 0) {
      // Pulse the first eligible pawn button. We don't recompute here — just hint at the row.
      return { selector: '[data-testid^="cll-move-"]:not(:disabled)', pulses: 3 };
    }
    return null;
  },
  component: ChutesLongGame,
};
