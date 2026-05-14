import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type {
  ThroughTheAgesFullState,
  ThroughTheAgesFullAction,
  ThroughTheAgesFullSettings,
} from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const ThroughTheAgesFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.ThroughTheAgesFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const throughTheAgesFullPlugin: GamePlugin<
  ThroughTheAgesFullState,
  ThroughTheAgesFullAction,
  typeof settings
> = {
  id: "through-the-ages-full",
  title: "Through the Ages (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Vlaada Chvátil's civilization builder across 4 ages — develop technology, wonders, and military to amass culture points.",
  howToPlay:
    "Four civilisations (You + 3 CPUs) compete across four Ages (A → I → II → III). On each turn you spend a pool of CIVIL action tokens (white) and MILITARY action tokens (red).\n\nCIVIL actions can: take a card from the visible card row (paying its civil-action cost), build/upgrade buildings from your tableau (pay stone), levy population from the bank into the worker pool, or play a leader/wonder.\n\nMILITARY actions can: take a bonus/aggression card from the row, or levy a unit (worker → +1 strength).\n\nThe card row drains in age-order: Age-A cards first, then I, II, III. When the row empties between ages we restock from the next age's deck. At the end of each age we resolve military strength rankings: highest-strength player gets +3 VP, then +1/0/-1.\n\nFinal scoring sums culture (VP) from leaders, wonders, blue/green tableau, and per-age military rewards, plus a small science bonus (1 VP per 3 science).\n\nAdvanced rules omitted for this XL scaffold (see TODO comment in state.ts): wonder multi-stage construction, government upgrade arcs, leader unique abilities, full event/aggression/war deck, tactics/colonies, blue-bank corruption, happiness uprisings.",
  settings,
  initialState: (seed: number, s: S) =>
    initialState(seed, s as unknown as ThroughTheAgesFullSettings),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "turn") {
      // Suggest the cheapest card in the row.
      return { selector: '[data-testid="tta-card-0"]', pulses: 3 };
    }
    if (state.phase === "end-of-age") {
      return { selector: '[data-testid="tta-resolve-age"]', pulses: 3 };
    }
    if (state.phase === "scoring") {
      return { selector: '[data-testid="tta-final"]', pulses: 3 };
    }
    return null;
  },
  component: ThroughTheAgesFullGame,
};
