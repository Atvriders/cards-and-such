import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceCornholeState, DiceCornholeAction, DiceCornholeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceCornholeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceCornholeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceCornholePlugin: GamePlugin<DiceCornholeState, DiceCornholeAction, typeof settings> = {
  id: "dice-cornhole",
  title: "Dice Cornhole",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Cornhole: throw to score; bag/ring on board = points; race to 21.',
  howToPlay: 'Dice Cornhole is a real, dice-driven simulation. Dice Cornhole: throw to score; bag/ring on board = points; race to 21.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceCornholeSettings),
  reducer,
  isTerminal,
  hint: (state: DiceCornholeState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-cornhole-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-cornhole-next"]', pulses: 3 };
    return null;
  },
  component: DiceCornholeGame,
};
