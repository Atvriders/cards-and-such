import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CentennialState, CentennialAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Centennial = /* @__PURE__ */ lazy(() => import("./Centennial.js").then((mod) => ({ default: mod.Centennial as unknown as React.ComponentType<unknown> })));
export const centennialSettings = {
  mode: {
    kind: "enum" as const,
    label: "Mode",
    options: ["solo", "vs-bot"] as const,
    default: "vs-bot",
  },
} as const;

type CentennialSettingsType = SettingsOf<typeof centennialSettings>;

export const centennialPlugin: GamePlugin<CentennialState, CentennialAction, typeof centennialSettings> = {
  id: "centennial",
  title: "Centennial",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race to score 1 through 12 in order. Roll 3 dice and use any combination that sums to your next target. First to 12 wins!",
  howToPlay: `Centennial is a sequential number racing game played with 3 dice. Your goal is to hit the numbers 1 through 12 in order, using the dice you roll each turn.

On each roll, you get 3 dice. You can use any non-empty subset of those dice — one die, two dice, or all three — as long as their sum equals your current target number. If any combination of your 3 dice adds up to the target, you advance to the next number. If not, your turn ends and you stay on the same target.

Examples:
- Target is 5: roll 2, 2, 3. Two dice sum to 5 — advance!
- Target is 9: roll 1, 3, 6. Three dice sum to 10, two sum to 7, 9, 4 — wait, 3+6=9! Advance!
- Target is 11: roll 2, 3, 4. No combination sums to 11 — miss.

You race simultaneously against a bot. Both players roll each turn. The first to complete the sequence 1→12 wins!

High targets like 10, 11, and 12 are hard to hit since they require large dice values. Low targets like 1, 2, 3 require exact single dice. The middle targets (5–8) are easiest to hit.

Click "Roll 3 Dice" each turn to roll. The progress bar shows how far both you and the bot have advanced.`,
  settings: centennialSettings,
  initialState: (seed: number, settings: CentennialSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-centennial-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-centennial-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-centennial-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-centennial-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-centennial-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-centennial-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-centennial-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-centennial-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-centennial-roll"]', pulses: 3 };
  },
  component: Centennial,
};
