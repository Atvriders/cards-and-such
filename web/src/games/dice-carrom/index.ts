import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceCarromState, DiceCarromAction, DiceCarromSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceCarromGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceCarromGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceCarromPlugin: GamePlugin<DiceCarromState, DiceCarromAction, typeof settings> = {
  id: "dice-carrom",
  title: "Dice Carrom",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Carrom: flick discs to score in scoring rings or pockets.',
  howToPlay: 'Dice Carrom is a real, dice-driven simulation. Dice Carrom: flick discs to score in scoring rings or pockets.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceCarromSettings),
  reducer,
  isTerminal,
  hint: (state: DiceCarromState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-carrom-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-carrom-next"]', pulses: 3 };
    return null;
  },
  component: DiceCarromGame,
};
