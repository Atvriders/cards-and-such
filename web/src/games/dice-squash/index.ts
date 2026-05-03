import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceSquashState, DiceSquashAction, DiceSquashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceSquashGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceSquashGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceSquashPlugin: GamePlugin<DiceSquashState, DiceSquashAction, typeof settings> = {
  id: "dice-squash",
  title: "Dice Squash",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Squash: play rallies to 11; first to target wins the match.',
  howToPlay: 'Dice Squash is a real, dice-driven simulation. Dice Squash: play rallies to 11; first to target wins the match.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceSquashSettings),
  reducer,
  isTerminal,
  hint: (state: DiceSquashState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-squash-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-squash-next"]', pulses: 3 };
    return null;
  },
  component: DiceSquashGame,
};
