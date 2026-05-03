import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { AirlineState, AirlineAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AirlineSim = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AirlineSim as unknown as React.ComponentType<unknown> })));
export const airlineSimPlugin = {
  id: "airline-sim",
  title: "Airline Sim",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build a small airline into a major carrier — manage routes, fleet, fuel costs, and safety over 16 quarters!",
  howToPlay: `Airline Sim puts you in the cockpit of a startup airline for 16 quarters (4 years). Starting with 2 planes and $1000, expand your fleet and optimize routes to build a profitable carrier.

Each quarter choose your Route type: Domestic (medium planes, steady demand), Regional (smaller planes, lower cost), or International (large planes, high revenue but expensive). Set your Ticket Price ($50–$400) — cheaper fares fill seats, premium prices boost revenue per seat.

Invest between quarters: buy additional Planes ($500 each, up to 8 fleet) to scale operations, upgrade Maintenance ($120 each, up to 3 levels) to cut costs and protect Safety Rating, or Hedge Fuel ($80) to avoid random price spikes that can devastate quarterly profit.

Safety Rating (0–100%) is key — it affects customer demand. Without maintenance upgrades, safety degrades over time. Keep it above 70% for healthy bookings.

Strategy: Start with domestic routes to build cash. Invest in maintenance early to prevent safety drops. Hedge fuel when you can afford it. Target $10,000 cash after 16 quarters for a top score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: AirlineState, action: AirlineAction) => AirlineState,
  isTerminal,
  hint: (state: AirlineState): HintTarget | null => {
    if (state.phase === "plan") return { selector: '[data-testid="hint-target-sim-run"]', pulses: 3 };
    if (state.phase === "results") return { selector: '[data-testid="hint-target-sim-next"]', pulses: 3 };
    return null;
  },
  component: AirlineSim,
} as unknown as GamePlugin;
