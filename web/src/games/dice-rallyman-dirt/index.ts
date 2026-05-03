import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceRallymanDirtState, DiceRallymanDirtAction, DiceRallymanDirtSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceRallymanDirtGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceRallymanDirtGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceRallymanDirtPlugin: GamePlugin<DiceRallymanDirtState, DiceRallymanDirtAction, typeof settings> = {
  id: "dice-rallyman-dirt",
  title: "Dice Rallyman Dirt",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Rallyman Dirt: race 20 squares against 3 CPUs; first across the line wins.',
  howToPlay: 'Dice Rallyman Dirt is a real, dice-driven simulation. Dice Rallyman Dirt: race 20 squares against 3 CPUs; first across the line wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceRallymanDirtSettings),
  reducer,
  isTerminal,
  hint: (state: DiceRallymanDirtState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-rallyman-dirt-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-rallyman-dirt-next"]', pulses: 3 };
    return null;
  },
  component: DiceRallymanDirtGame,
};
