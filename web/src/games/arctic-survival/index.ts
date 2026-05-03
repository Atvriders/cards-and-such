import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArcticSurvivalState, ArcticSurvivalAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ArcticSurvival = /* @__PURE__ */ lazy(() => import("./ArcticSurvival.js").then((mod) => ({ default: mod.ArcticSurvival as unknown as React.ComponentType<unknown> })));
export const arcticSurvivalSettings = {
  days: {
    kind: "enum" as const,
    label: "Days",
    options: ["5", "7", "10"] as const,
    default: "7",
  },
} as const;

type ArcticSurvivalSettingsType = SettingsOf<typeof arcticSurvivalSettings>;

export const arcticSurvivalPlugin: GamePlugin<ArcticSurvivalState, ArcticSurvivalAction, typeof arcticSurvivalSettings> = {
  id: "arctic-survival",
  title: "Arctic Survival",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Survive the frozen wilderness by managing food, fuel, and warmth day by day.",
  howToPlay: `Arctic Survival is a resource management board game where you must endure a harsh frozen wilderness for 5, 7, or 10 days. Each day you have three choices: forage for food, rest and warm up, or gather fuel. Each action has trade-offs — foraging yields food but costs fuel, resting restores warmth and health, and gathering fuel costs food.

At the end of each day an Arctic event occurs. A blizzard drains warmth and fuel. Finding a supply cache rewards you with one of the three resources. Frostbite saps health directly. Calm days give you a free moment to recover.

Your four vital stats are HP, Food, Fuel, and Warmth. Each day consumes one unit of food and one unit of fuel automatically. If your warmth drops too low (2 or below) you lose a health point each day. Running out of food also costs health. If HP reaches zero, you perish.

Strategy is everything: on calm days, forage aggressively; when a blizzard looms, prioritise fuel. Never let warmth bottom out — hypothermia is the fastest killer. Balancing all three resources at once is the core challenge.

Survive until the final day and your score is calculated from remaining HP, food, fuel, and warmth. A perfect game scores 100. Even partial survival earns points based on how long you lasted and how well-stocked you remain.`,
  settings: arcticSurvivalSettings,
  initialState: (seed: number, settings: ArcticSurvivalSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: ArcticSurvival,
};
