import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RiskFullState, RiskFullAction, RiskFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const RiskFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({ default: mod.RiskFullGame as unknown as React.ComponentType<unknown> })),
);

const settings = {
  startingArmies: { kind: "number" as const, label: "Starting armies (per side)", min: 20, max: 50, step: 5, default: 40 },
  cpuAggression: { kind: "number" as const, label: "CPU aggression (0=cautious, 2=ruthless)", min: 0, max: 2, step: 1, default: 1 },
} as const;
type S = SettingsOf<typeof settings>;

export const riskFullPlugin: GamePlugin<RiskFullState, RiskFullAction, typeof settings> = {
  id: "risk-full",
  title: "Risk: Full World Domination",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic 42-territory Risk: continent bonuses, escalating card sets, fortification, and the dice attack stack vs CPU.",
  howToPlay: `Risk: Full World Domination is the classic six-continent, 42-territory conquest game played 1-vs-1 against the Crimson Empire CPU. Each side starts with 40 armies distributed across its territories. Your goal: hold every territory on the map.

Each turn has three phases:

1. Reinforce — You receive max(3, owned/3) armies plus continent bonuses (N.America 5, S.America 2, Europe 5, Africa 3, Asia 7, Australia 2). Trade in any valid 3-card set (three of a kind, one of each, or any combo with a wild) for escalating armies: 4, 6, 8, 10, 12, 15, then +5 each. If a card's territory is yours, +2 extra are placed there. Click a territory to add an army. The trade panel shows your hand.

2. Attack — Click one of your territories with 2+ armies, then click an adjacent enemy. You roll up to 3 dice, defender rolls up to 2. Top dice are compared and losers lose an army (ties to defender). Reduce a defender to 0 to conquer. After your first conquest of the turn you draw a territory card. If you eliminate the CPU you steal all its cards.

3. Fortify — Move armies between two of your own territories that are connected by a friendly chain. Then end your turn.

Win by conquering every territory. The Crimson Empire CPU defends its continents, prioritizes weak borders, and force-trades cards at 5+ in hand. Advanced rules omitted (XL tier): mission cards, capital cities, neutral armies, multi-player ≥3, naval-zone variants.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RiskFullSettings),
  reducer,
  isTerminal,
  hint: (s) => {
    if (isTerminal(s) !== null) return null;
    if (s.phase === "cpu") return null;
    return { selector: ".riskfull-btn-primary, .riskfull-btn", pulses: 3 };
  },
  component: RiskFullGame,
};
