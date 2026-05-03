import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceKillerDartsState, DiceKillerDartsAction, DiceKillerDartsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceKillerDartsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceKillerDartsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceKillerDartsPlugin: GamePlugin<DiceKillerDartsState, DiceKillerDartsAction, typeof settings> = {
  id: "dice-killer-darts",
  title: "Dice Killer Darts",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Killer Darts: claim a number, become Killer at 5 lives, defeat opponents to win.',
  howToPlay: 'Dice Killer Darts is a real, dice-driven simulation. Dice Killer Darts: claim a number, become Killer at 5 lives, defeat opponents to win.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceKillerDartsSettings),
  reducer,
  isTerminal,
  hint: (state: DiceKillerDartsState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-killer-darts-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-killer-darts-next"]', pulses: 3 };
    return null;
  },
  component: DiceKillerDartsGame,
};
