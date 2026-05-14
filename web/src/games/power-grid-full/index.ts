import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { PowerGridFullState, PowerGridFullAction, PowerGridFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const PowerGridFull = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({
  default: mod.PowerGridFullGame as unknown as React.ComponentType<unknown>,
})));

const settings = {
  _dummy: { kind: "boolean" as const, label: "dummy", default: false },
} as const;
type S = SettingsOf<typeof settings>;

export const powerGridFullPlugin: GamePlugin<PowerGridFullState, PowerGridFullAction, typeof settings> = {
  id: "power-grid-full",
  title: "Power Grid (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Auction power plants, buy fuel, build a USA network. 1 human + 3 CPU.",
  howToPlay: `Power Grid (Full): build the largest network of powered cities in the USA. You play against 3 CPU rivals. Each turn cycles through five phases:

1) Order — players are sorted by network size (cities). Most cities = goes last in auction/resources/build (advantage of seeing other's moves first).
2) Auction — in reverse order, each player may buy one plant from the current row (the cheapest 4 in the market) at face value. Pass to skip. Higher-numbered plants cost more but generally power more cities. (Advanced ascending-bid rules omitted — XL.)
3) Resources — in reverse order, each player buys coal/oil/garbage/uranium. Prices slide: as supply drops, the next unit costs more.
4) Build — in reverse order, connect new cities. Cost = a city slot ($10 / $15 / $20 for the 1st / 2nd / 3rd connector) plus the cheapest connection from your network.
5) Bureaucracy — power your cities (consume the fuel each plant needs) and earn income. The income table rewards bigger powered networks. Resources are restocked and the plant market refills.

The game ends the round any player connects 15 cities. Winner = most cities actually powered (cash tiebreaker).

Advanced rules omitted (XL tier): real ascending bidding, plant retirement / discard, step-2 and step-3 game transitions, per-region adjacency costs, "no double bidding" rules, and hybrid plant choice UI. The CPU buys mid-tier plants greedily, stocks one full power cycle of fuel, and expands by cheapest connection.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PowerGridFullSettings),
  reducer,
  isTerminal,
  hint: (state: PowerGridFullState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.phase === "auction") return { selector: '[data-testid="pgf-auction-primary"]', pulses: 3 };
    if (state.phase === "resources") return { selector: '[data-testid="pgf-resource-primary"]', pulses: 3 };
    if (state.phase === "build") return { selector: '[data-testid="pgf-build-primary"]', pulses: 3 };
    if (state.phase === "bureaucracy") return { selector: '[data-testid="pgf-power-primary"]', pulses: 3 };
    if (state.phase === "order") return { selector: '[data-testid="pgf-order-tick"]', pulses: 3 };
    return null;
  },
  component: PowerGridFull,
};
