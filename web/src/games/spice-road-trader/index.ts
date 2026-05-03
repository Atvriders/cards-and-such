import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { SpiceRoadTraderState, SpiceRoadTraderAction, SpiceRoadTraderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpiceRoadTraderGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpiceRoadTraderGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const spiceRoadTraderPlugin: GamePlugin<SpiceRoadTraderState, SpiceRoadTraderAction, typeof settings> = {
  id: "spice-road-trader",
  title: "Spice Road Trader",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Camel caravan spice conversion. Trade up the resource chain.",
  howToPlay: "Spice Road Trader is a ten-turn caravan-trading sim inspired by Century: Spice Road. You start with $200. Each turn pick: Invest $30 (1 Spice in your caravan), Save (5% interest), Hire a Camel for $50, or Trade a Spice for a $30-50 oasis-market price. After actions, each Spice pays $6 trade margin and each Camel earns $9 in caravan profits. Mid-screen flavor describes trading at exotic ports and oases. Score equals net worth on turn 10. The spice-road math: Spices return 20% on cost, Camels return 18%, saving still compounds at 5%, so build the caravan. Strategy: stack 6+ Spices for steady margin, then 2 Camels for amplification. Trade only in mid-game when you're cash-poor. Strong runs hit $600-750. Pure save runs hit $325. The trick is to keep the cash flow alive without selling at low spot prices.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpiceRoadTraderSettings),
  reducer,
  isTerminal,
  hint: (state: SpiceRoadTraderState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-spice-road-trader-primary"]', pulses: 3 } : null),
  component: SpiceRoadTraderGame,
};
