import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BaronsEngineState, BaronsEngineAction, BaronsEngineSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BaronsEngineGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BaronsEngineGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const baronsEnginePlugin: GamePlugin<BaronsEngineState, BaronsEngineAction, typeof settings> = {
  id: "barons-engine",
  title: "Barons Engine",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simple economic engine. Invest in resource chains for points.",
  howToPlay: "Barons Engine is a ten-turn resource-chain economy game. You start with $200 cash. Each turn pick: Invest $30 (a Mine), Save (5%), Hire a Foreman for $50, or Trade a Mine for a $30-50 sale price. After actions, each Mine yields $7 ore profit and each Foreman generates $11 in management gains. Mid-screen flavor reflects resource-chain operations: mining, refining, and shipping. Score equals net worth on turn 10. The engine: Mines pay 23% on basis, Foremen pay 22%, saving pays 5%, so engine-building wins decisively. The pacing trick is the early ramp: don't blow $200 on one Foreman. Spread investments. Aim for 5-6 Mines and 1-2 Foremen by the end. Strong runs hit $700+. Reckless trades on low-value markets bleed the engine, so trade only when you need cash flow.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BaronsEngineSettings),
  reducer,
  isTerminal,
  hint: (state: BaronsEngineState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-barons-engine-primary"]', pulses: 3 } : null),
  component: BaronsEngineGame,
};
