import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { CatanState, CatanAction, CatanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const CatanFull = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({
  default: mod.CatanFullGame as unknown as React.ComponentType<unknown>,
})));

const settings = {
  vpTarget: {
    kind: "number" as const,
    label: "Victory Points to Win",
    min: 8,
    max: 12,
    step: 1,
    default: 10,
  },
} as const;

export const catanFullPlugin: GamePlugin<CatanState, CatanAction, typeof settings> = {
  id: "catan-full",
  title: "Catan (Settlers, Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build settlements, trade sheep for wheat, longest road + largest army, robber on every 7.",
  howToPlay: `Catan: claim the island. You and one CPU rival each place two starting settlements with a road from each. After setup, take turns rolling 2d6 to produce resources from hexes adjacent to your settlements (1) and cities (2). A roll of 7 summons the Robber — any player holding more than 7 cards loses one to the roller; the Robber blocks production on whatever hex it sits on.

Costs (Lumber/Brick/Wool/Grain/Ore):
  - Road: 1 Wood + 1 Brick
  - Settlement: 1 Wood + 1 Brick + 1 Sheep + 1 Wheat (1 VP)
  - City (upgrade): 2 Wheat + 3 Ore (2 VP)
  - Development card: 1 Sheep + 1 Wheat + 1 Ore

Distance rule: every new settlement must be at least one edge from any other settlement or city. Roads must extend your own road network.

Bonus titles:
  - Longest Road (+2 VP): first to a connected route of 5 roads.
  - Largest Army (+2 VP): first to play 3 Knights from dev cards.

You win at 10 VP (or whatever you set under settings).

Bank trades: 4-of-a-kind buys 1 of any other resource (ports / 2:1 / 3:1 are omitted — XL tier).

Dev cards are simplified to Knights and hidden Victory Point cards only. Other dev cards (Road Building, Year of Plenty, Monopoly) are omitted.

The CPU prefers high-pip vertices (probability), builds cities before settlements, and plays a Knight when the Robber lands on its production hexes.`,
  settings,
  initialState: (seed: number, s: CatanSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.phase === "setup" && state.current === 0) {
      if (state.setupSubPhase === "place_settlement") {
        return { selector: '[data-testid="catan-vertex-best"]', pulses: 3 };
      }
      if (state.setupSubPhase === "place_road") {
        return { selector: '[data-testid="catan-edge-best"]', pulses: 3 };
      }
    }
    if (state.phase === "roll" && state.current === 0) {
      return { selector: '[data-testid="catan-roll"]', pulses: 3 };
    }
    if (state.phase === "play" && state.current === 0) {
      return { selector: '[data-testid="catan-end-turn"]', pulses: 3 };
    }
    if (state.phase === "cpu") {
      return { selector: '[data-testid="catan-cpu-tick"]', pulses: 3 };
    }
    return null;
  },
  component: CatanFull,
};
