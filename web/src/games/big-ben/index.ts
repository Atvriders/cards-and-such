import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BigBenState, BigBenAction, BigBenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BigBenGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BigBenGame as unknown as React.ComponentType<unknown> })));
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const bigBenPlugin: GamePlugin<BigBenState, BigBenAction, typeof settings> = {
  id: "big-ben",
  title: "Big Ben",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Big Ben: clock built up by suit from each hour.",
  howToPlay: "Two-deck Big Ben: clock built up by suit from each hour. Click Tick to flip the held card into its rank-slot; the next card in that slot becomes the new held card. Win when every slot fills before the centre runs out.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as BigBenSettings),
  hint: (state: BigBenState): HintTarget | null => {
    if (state.won || state.lost) return null;
    if (state.held) {
      return { selector: '[data-testid="hint-target-big-ben-tick"]', pulses: 3 };
    }
    return null;
  },
  reducer,
  isTerminal,
  component: BigBenGame,
};
