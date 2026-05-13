import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { P10State, P10Action, P10Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const Phase10FullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.Phase10FullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "Reserved", default: false },
} as const;

type S = SettingsOf<typeof settings>;

export const phase10FullPlugin: GamePlugin<P10State, P10Action, typeof settings> = {
  id: "phase-10-full",
  title: "Phase 10 (Full)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Race three CPUs through 10 specific hand-pattern phases — sets, runs, and color groups.",
  howToPlay:
    "Phase 10 is a rummy-style card game played with a 108-card deck of four colors (red, blue, green, yellow), each numbered 1-12 with two copies, plus 8 Wilds and 4 Skips. You're dealt 10 cards and play against three CPU opponents.\n\nOn your turn you must (1) draw one card — either the top of the face-down stockpile, or the top of the discard pile — then optionally (2) lay down the current round's phase by selecting the exact cards that form it and pressing Lay Down Phase, and finally (3) discard one card to end your turn. You can only lay your phase down once per round. Going out (emptying your hand after laying down) ends the round.\n\nThe phases must be completed in order:\n  1. 2 sets of 3 (same number)\n  2. 1 set of 3 + 1 run of 4\n  3. 1 set of 4 + 1 run of 4\n  4. 1 run of 7\n  5. 1 run of 8\n  6. 1 run of 9\n  7. 2 sets of 4\n  8. 7 cards of 1 color\n  9. 1 set of 5 + 1 set of 2\n 10. 1 set of 5 + 1 set of 3\n\nWilds substitute for any numbered card in a meld (a meld can't be all wilds). Skip cards cannot be melded. At round end every player adds penalty points for cards remaining in hand (1-9 = 5 pts, 10-12 = 10 pts, Skip = 15, Wild = 25). Players who completed their phase advance; others remain. First to complete Phase 10 wins; ties are broken by lowest penalty total.\n\nFinal score on the leaderboard is 1000 minus your penalty (higher is better). Losing returns zero.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as P10Settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if (isTerminal(state)) return null;
    if (state.stage === "draw" && state.current === 0) {
      return { selector: '[data-testid="hint-target-phase-10-full-draw-stock"]', pulses: 3 };
    }
    if (state.stage === "play" && state.current === 0 && !state.laidThisRound[0]) {
      return { selector: '[data-testid="hint-target-phase-10-full-lay"]', pulses: 3 };
    }
    if (state.stage === "round-end") {
      return { selector: '[data-testid="hint-target-phase-10-full-next-round"]', pulses: 3 };
    }
    return null;
  },
  component: Phase10FullGame,
};
