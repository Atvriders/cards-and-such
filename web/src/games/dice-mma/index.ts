import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceMmaState, DiceMmaAction, DiceMmaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceMmaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceMmaGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceMmaPlugin: GamePlugin<DiceMmaState, DiceMmaAction, typeof settings> = {
  id: "dice-mma",
  title: "Dice MMA",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice MMA: 5 rounds; land strikes, hunt the KO.',
  howToPlay: 'Dice MMA is a real, dice-driven simulation. Dice MMA: 5 rounds; land strikes, hunt the KO.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceMmaSettings),
  reducer,
  isTerminal,
  hint: (state: DiceMmaState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-mma-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-mma-next"]', pulses: 3 };
    return null;
  },
  component: DiceMmaGame,
};
