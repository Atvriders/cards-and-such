import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TacoBurritoCardState, TacoBurritoCardAction, TacoBurritoCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TacoBurritoCardGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TacoBurritoCardGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tacoBurritoCardPlugin: GamePlugin<TacoBurritoCardState, TacoBurritoCardAction, typeof settings> = {
  id: "taco-burrito-card", title: "Taco vs Burrito Card", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Taco vs Burrito ingredient-card trivia. Identify points and effects.",
  howToPlay: "Taco vs Burrito Card is inspired by the wildly popular family card game Taco vs Burrito (2017), designed by then-7-year-old Alex Butler. Players build their wackiest, point-richest taco or burrito by playing ingredient cards and Action cards on themselves and stealing from rivals. Twelve rounds quiz you on card types, point values, and rule outcomes. Pick from four candidates, ten points each, 120 max. Ingredient cards range from straightforward (Avocado, Cheese, Tomato) to weird (Worm Salsa, Eggplant Whip). Action cards include Trade, Steal, and Skip. Highest total points across your taco/burrito wins. Family-game players hit 80-100; new players should still clear 60. Run takes around two minutes. Submit each pick and Next to advance. Taco vs Burrito famously sold a million copies its first year and remains a top-seller in the family-card-game category alongside Sushi Go, Spot It, and Exploding Kittens.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TacoBurritoCardSettings),
  reducer, isTerminal, hint: (state: TacoBurritoCardState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-taco-burrito-card-answer-0"]', pulses: 3 } : null, component: TacoBurritoCardGame,
};
