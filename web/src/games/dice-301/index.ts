import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { Dice301State, Dice301Action, Dice301Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Dice301Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Dice301Game as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const dice301Plugin: GamePlugin<Dice301State, Dice301Action, typeof settings> = {
  id: "dice-301",
  title: "Dice 301",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice 301: count down from 301 to exactly 0 with simulated darts.',
  howToPlay: 'Dice 301 is a real, dice-driven simulation. Dice 301: count down from 301 to exactly 0 with simulated darts.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Dice301Settings),
  reducer,
  isTerminal,
  hint: (state: Dice301State): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-301-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-301-next"]', pulses: 3 };
    return null;
  },
  component: Dice301Game,
};
