import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PoolRummyRState, PoolRummyRAction, PoolRummyRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PoolRummyRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PoolRummyRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const poolRummyRPlugin: GamePlugin<PoolRummyRState, PoolRummyRAction, typeof settings> = {
  id: "pool-rummy-r", title: "Pool Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Indian Rummy variant — eliminated when score exceeds threshold.",
  howToPlay: "Pool Rummy is a popular variant of Indian Rummy where players accumulate penalty points each round; whoever crosses a fixed threshold (101 or 201) is eliminated. In this short version you play six rounds against a CPU and the lowest accumulated penalty wins.\n\nEach round you and the CPU are each dealt nine cards. The engine auto-melds and computes deadwood: unmelded card values, with aces counting one, 2-10 face value, and J/Q/K counting ten. The deadwood total is added to the running tally.\n\nSix rounds are played. At the end, your inverted total is converted to a score: 200 minus your final deadwood total, floored at zero. A bonus of fifteen points is awarded per round in which your deadwood is below the CPU's.\n\nExpected score is around fifty-five to ninety points across six rounds. A pure-sequence-rich hand drops deadwood fast. The CPU plays randomly so you usually beat its average; a hot dealing streak (three or more rounds of low deadwood) can push past 130.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PoolRummyRSettings),
  reducer, isTerminal, 
  hint: (state: PoolRummyRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-pool-rummy-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-pool-rummy-r-next"]', pulses: 3 };
    return null;
  },
  component: PoolRummyRGame,
};
