import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceBadmintonState, DiceBadmintonAction, DiceBadmintonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceBadmintonGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceBadmintonGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceBadmintonPlugin: GamePlugin<DiceBadmintonState, DiceBadmintonAction, typeof settings> = {
  id: "dice-badminton",
  title: "Dice Badminton",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Badminton: play rallies to 21; first to target wins the match.',
  howToPlay: 'Dice Badminton is a real, dice-driven simulation. Dice Badminton: play rallies to 21; first to target wins the match.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceBadmintonSettings),
  reducer,
  isTerminal,
  hint: (state: DiceBadmintonState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-badminton-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-badminton-next"]', pulses: 3 };
    return null;
  },
  component: DiceBadmintonGame,
};
