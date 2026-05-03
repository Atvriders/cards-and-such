import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NimState, NimAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Nim = /* @__PURE__ */ lazy(() => import("./Nim.js").then((mod) => ({ default: mod.Nim as unknown as React.ComponentType<unknown> })));
export const nimSettings = {
  piles: {
    kind: "enum" as const,
    label: "Number of Piles",
    options: ["3", "4", "5"] as const,
    default: "3",
  },
  rule: {
    kind: "enum" as const,
    label: "Rule",
    options: ["standard", "misere"] as const,
    default: "misere",
  },
} as const;

type NimSettingsType = SettingsOf<typeof nimSettings>;

export const nimPlugin: GamePlugin<NimState, NimAction, typeof nimSettings> = {
  id: "nim",
  title: "Nim",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Remove stones from piles — avoid (or take) the last one.",
  howToPlay: `Nim is a two-player strategy game played with several piles of stones. On your turn, choose any one pile and remove as many stones as you like from it (at least one). You and the bot alternate turns.

Standard rule: the player who takes the last stone wins. Misère rule: the player who takes the last stone loses. All other rules remain identical — only the goal changes.

To move, click the + and − buttons below a pile to set how many stones to remove, then press "Take." The bot plays immediately after you.

The bot uses perfect mathematical play based on XOR of pile sizes (Sprague-Grundy theory). In Standard Nim, the winning strategy is to always leave the XOR of all pile sizes equal to zero. In Misère Nim, the strategy is identical except in the end-game when all piles have at most one stone.

Settings: Piles changes the number of piles (3–5); each pile starts with a random 3–9 stones. Rule switches between Standard and Misère.

Scoring: win = 100, loss = 0. The bot plays near-perfectly, so finding a win is a genuine challenge unless you go first in a losing position for the bot.`,
  settings: nimSettings,
  initialState: (seed: number, settings: NimSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: NimState): HintTarget | null => {
    if (state.gameOver) return null;
    if (state.turn !== "player") return null;
    const piles = state.piles;
    const xorVal = piles.reduce((acc, p) => acc ^ p, 0);
    if (xorVal !== 0) {
      // Find a pile we can reduce so the resulting XOR is 0.
      for (let i = 0; i < piles.length; i++) {
        const target = piles[i]! ^ xorVal;
        if (target < piles[i]!) {
          return { selector: `[data-testid="nim-pile-${i}"]`, pulses: 3 };
        }
      }
    }
    // No winning move (XOR already 0): pulse the largest non-empty pile.
    let bestIdx = -1;
    let bestVal = 0;
    for (let i = 0; i < piles.length; i++) {
      if (piles[i]! > bestVal) {
        bestVal = piles[i]!;
        bestIdx = i;
      }
    }
    if (bestIdx < 0) return null;
    return { selector: `[data-testid="nim-pile-${bestIdx}"]`, pulses: 3 };
  },
  component: Nim,
};
