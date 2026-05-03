import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceKaisaState, DiceKaisaAction, DiceKaisaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceKaisaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceKaisaGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceKaisaPlugin: GamePlugin<DiceKaisaState, DiceKaisaAction, typeof settings> = {
  id: "dice-kaisa",
  title: "Dice Kaisa",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Kaisa: pot reds and colours in sequence to build a break.',
  howToPlay: 'Dice Kaisa is a real, dice-driven simulation. Dice Kaisa: pot reds and colours in sequence to build a break.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceKaisaSettings),
  reducer,
  isTerminal,
  hint: (state: DiceKaisaState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-kaisa-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-kaisa-next"]', pulses: 3 };
    return null;
  },
  component: DiceKaisaGame,
};
