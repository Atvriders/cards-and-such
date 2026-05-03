import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShutTheBoxState, ShutTheBoxAction } from "./state.js";
import { initialState, reducer, isTerminal, validCombinations } from "./state.js";
const ShutTheBox = /* @__PURE__ */ lazy(() => import("./ShutTheBox.js").then((mod) => ({ default: mod.ShutTheBox as unknown as React.ComponentType<unknown> })));
export const shutTheBoxSettings = {
  targetScore: {
    kind: "enum" as const,
    label: "Target Score to Beat",
    options: ["25", "20", "15"] as const,
    default: "25",
  },
} as const;

type ShutTheBoxSettingsType = SettingsOf<typeof shutTheBoxSettings>;

export const shutTheBoxPlugin: GamePlugin<ShutTheBoxState, ShutTheBoxAction, typeof shutTheBoxSettings> = {
  id: "shut-the-box",
  title: "Shut the Box",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic pub dice game. Roll 2 dice and close numbered tiles that sum to your roll. Keep rolling until no valid combination remains. Lower score wins — can you shut the box?",
  howToPlay: `Shut the Box is a classic British pub game. Nine numbered tiles (1–9) start open. Your goal is to close as many tiles as possible — ideally all of them.

Each turn: click "Roll Dice" to roll two dice. Add them together to get your target sum. Then select one or more open tiles that add up to that sum and click "Close Selected Tiles." For example, if you roll a 7, you could close tile 7, or tiles 3+4, or tiles 1+2+4.

You can click on the combo hints below the tiles to auto-select a valid combination, or click tiles individually to build your own. The selected sum is displayed so you know when it matches the roll.

After closing tiles, roll again. The game ends when no combination of open tiles sums to your roll. Your score is the sum of all remaining open tiles — lower is better.

Win condition: beat the target score (default 25). Closing all tiles earns a perfect score of 0. Scores of 5 or less are excellent; under 15 is solid.

Strategy: early in the game, prefer closing multiple smaller tiles to keep your options flexible. Closing the high tiles (7, 8, 9) early is also powerful since they're hardest to use later.`,
  settings: shutTheBoxSettings,
  initialState: (seed: number, settings: ShutTheBoxSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: ShutTheBoxState): HintTarget | null => {
    if (state.phase === "preRoll") {
      return { selector: '[data-testid="hint-target-shut-the-box-roll"]', pulses: 3 };
    }
    if (state.phase !== "chooseTiles") return null;
    const combos = validCombinations(state.tiles, state.rollSum);
    if (combos.length === 0) return null;
    // Choose the combo whose max tile is highest — closing big tiles first
    // is the standard strategy.
    let best = combos[0]!;
    let bestKey = Math.max(...best);
    for (const c of combos) {
      const k = Math.max(...c);
      if (k > bestKey) { best = c; bestKey = k; }
    }
    const tile = best[best.length - 1]!; // pulse the highest tile in chosen combo
    return { selector: `[data-testid="hint-target-shut-the-box-tile-${tile}"]`, pulses: 3 };
  },
  component: ShutTheBox,
};
