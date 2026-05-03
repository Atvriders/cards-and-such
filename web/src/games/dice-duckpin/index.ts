import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceDuckpinState, DiceDuckpinAction, DiceDuckpinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceDuckpinGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceDuckpinGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceDuckpinPlugin: GamePlugin<DiceDuckpinState, DiceDuckpinAction, typeof settings> = {
  id: "dice-duckpin",
  title: "Dice Duckpin Bowling",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Duckpin Bowling: 2-die rolls = pins; classic strike/spare scoring across 10 frames.',
  howToPlay: 'Dice Duckpin Bowling is a real, dice-driven simulation. Dice Duckpin Bowling: 2-die rolls = pins; classic strike/spare scoring across 10 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceDuckpinSettings),
  reducer,
  isTerminal,
  hint: (state: DiceDuckpinState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-duckpin-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-duckpin-next"]', pulses: 3 };
    return null;
  },
  component: DiceDuckpinGame,
};
