import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceHalveItState, DiceHalveItAction, DiceHalveItSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceHalveItGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceHalveItGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceHalveItPlugin: GamePlugin<DiceHalveItState, DiceHalveItAction, typeof settings> = {
  id: "dice-halve-it",
  title: "Dice Halve-It",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Halve-It: hit listed targets in order, miss = score halved.',
  howToPlay: 'Dice Halve-It is a real, dice-driven simulation. Dice Halve-It: hit listed targets in order, miss = score halved.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceHalveItSettings),
  reducer,
  isTerminal,
  hint: (state: DiceHalveItState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-halve-it-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-halve-it-next"]', pulses: 3 };
    return null;
  },
  component: DiceHalveItGame,
};
