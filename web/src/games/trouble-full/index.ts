import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { TroubleFullState, TroubleFullAction, TroubleFullSettings } from "./state.js";
import { initialState, reducer, isTerminal, canMove } from "./state.js";

const TroubleFullLazy = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.TroubleFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "_", default: false },
} as const;

type S = SettingsOf<typeof settings>;

export const troubleFullPlugin: GamePlugin<TroubleFullState, TroubleFullAction, typeof settings> = {
  id: "trouble-full",
  title: "Trouble (Full 4-Pawn)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pop the dome to roll, race 4 pegs home, bump opponents back to base!",
  howToPlay: `Trouble (Full 4-Pawn) is the classic Pop-O-Matic race for four. You play as Blue; three CPU opponents (Red, Green, Orange) race the same track.

Each player has 4 pegs starting in their color's home base ("yard"). To bring a peg out onto the shared 28-square track, you must pop a 6 — pegs enter at your color's start square and travel clockwise.

On your turn, click "Pop!" to roll the Pop-O-Matic die. Then pick any peg that can legally move. Rolling a 6 grants a bonus turn — pop again right away. If you can't make any legal move with what you rolled, the turn auto-passes.

Landing on an opponent's peg on the shared track sends that peg back to their home base — the satisfying "bump." Start squares (0, 7, 14, 21) are safe and cannot be captured on. You may not land on your own peg.

After 28 shared squares you turn onto your color's home stretch — a private 4-square lane that no opponent can enter. From there you need an exact roll to land on the final "Finish" square; over-rolling means the peg stays put and you must try another peg (or pass).

The first player to get all four pegs to Finish wins. Your score = 10 minus your finish rank (10 if you win, 9 for second, 8 for third, 7 for fourth). If you finish but only partway, you get a small consolation score.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as TroubleFullSettings),
  reducer,
  isTerminal,
  hint: (state: TroubleFullState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.turn !== 0) return null;
    if (state.phase === "rolling") {
      return { selector: '[data-testid="trouble-full-pop"]', pulses: 3 };
    }
    // moving phase: point at the first legal pawn move button, or the pass.
    for (let pi = 0; pi < state.pawns[0]!.length; pi++) {
      if (canMove(state.pawns, 0, pi, state.die)) {
        return { selector: `[data-testid="trouble-full-move-${pi}"]`, pulses: 3 };
      }
    }
    return { selector: '[data-testid="trouble-full-pass"]', pulses: 3 };
  },
  component: TroubleFullLazy,
};
