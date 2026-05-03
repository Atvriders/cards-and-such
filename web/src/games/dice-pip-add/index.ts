import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePipAddState, DicePipAddAction, DicePipAddSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DicePipAdd = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DicePipAdd as unknown as React.ComponentType<unknown> })));
const dicePipAddSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["6", "8", "10"] as const, default: "8" as const },
} as const;

type S = SettingsOf<typeof dicePipAddSettings>;

export const dicePipAddPlugin: GamePlugin<DicePipAddState, DicePipAddAction, typeof dicePipAddSettings> = {
  id: "dice-pip-add",
  title: "Dice Pip Add",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A target sum is given. Three dice are revealed one by one — choose Add or Skip for each to build a total as close to the target as possible!",
  howToPlay: `Dice Pip Add challenges your decision-making. Each round a target number between 5 and 16 is announced. Three dice are laid out, revealed one at a time.

For each die, you choose: ADD its value to your running total, or SKIP and move on. After all three dice are decided, your final total is compared to the target.

Hit the target exactly and earn 50 points. Land within 2 of the target (above or below) and earn 20 points. Miss by more and you earn nothing.

The skill is in when to add and when to skip. If your total is already close to the target, skipping a high die is smart. If you still have room, adding might be the right call.

Use Settings to choose 6, 8, or 10 rounds. Total score accumulates across rounds. Can you hit the target perfectly round after round?`,
  settings: dicePipAddSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as DicePipAddSettings),
  reducer, isTerminal, 
  hint: (state: any) => {
    if ((state as any).phase === "gameover" || (state as any).gameOver) return null;
    if ((state as any).phase === "result") return { selector: '[data-testid="hint-target-dice-pip-add-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-pip-add-roll"]', pulses: 3 };
  },
  component: DicePipAdd,
};
