import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceSnookerMatchState, DiceSnookerMatchAction, DiceSnookerMatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceSnookerMatchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceSnookerMatchGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceSnookerMatchPlugin: GamePlugin<DiceSnookerMatchState, DiceSnookerMatchAction, typeof settings> = {
  id: "dice-snooker-match",
  title: "Dice Snooker Match",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Snooker Match: pot reds and colours in sequence to build a break.',
  howToPlay: 'Dice Snooker Match is a real, dice-driven simulation. Dice Snooker Match: pot reds and colours in sequence to build a break.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceSnookerMatchSettings),
  reducer,
  isTerminal,
  hint: (state: DiceSnookerMatchState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-snooker-match-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-snooker-match-next"]', pulses: 3 };
    return null;
  },
  component: DiceSnookerMatchGame,
};
