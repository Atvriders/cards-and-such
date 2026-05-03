import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceFormulaDeState, DiceFormulaDeAction, DiceFormulaDeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceFormulaDeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceFormulaDeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceFormulaDePlugin: GamePlugin<DiceFormulaDeState, DiceFormulaDeAction, typeof settings> = {
  id: "dice-formula-de",
  title: "Dice Formula Dé",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Formula Dé: race 24 squares against 3 CPUs; first across the line wins.',
  howToPlay: 'Dice Formula Dé is a real, dice-driven simulation. Dice Formula Dé: race 24 squares against 3 CPUs; first across the line wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceFormulaDeSettings),
  reducer,
  isTerminal,
  hint: (state: DiceFormulaDeState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-formula-de-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-formula-de-next"]', pulses: 3 };
    return null;
  },
  component: DiceFormulaDeGame,
};
