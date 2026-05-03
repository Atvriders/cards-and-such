import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceClutchRollState, DiceClutchRollAction, DiceClutchRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceClutchRollGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceClutchRollGame as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceClutchRollPlugin: GamePlugin<DiceClutchRollState, DiceClutchRollAction, typeof settings> = {
  id: "dice-clutch-roll", title: "Dice Clutch Roll", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Roll 4 dice and automatically keep the top 3 — score their sum each round.",
  howToPlay: `Dice Clutch Roll gives you an extra chance — you roll four dice, but only the highest three count toward your score. The lowest die is dropped automatically.

This simple mechanic makes every roll a bit better than pure three-dice rolls. Your maximum score per round is 18 (three sixes), and average outcomes trend higher than with just three dice.

Over 10 or 20 rounds, your accumulated score reflects the best of what the dice offered. Simple, satisfying, and a touch more generous than the pure roll!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceClutchRollSettings),
  reducer,
  isTerminal,
  hint: (state: DiceClutchRollState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "waiting") return { selector: '[data-testid="hint-target-dice-clutch-roll-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-clutch-roll-next"]', pulses: 3 };
    return null;
  },
  component: DiceClutchRollGame,
};
