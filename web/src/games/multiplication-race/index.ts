import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MultiplicationRaceState, MultiplicationRaceAction, MultiplicationRaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MultiplicationRaceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MultiplicationRaceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const multiplicationRacePlugin: GamePlugin<MultiplicationRaceState, MultiplicationRaceAction, typeof settings> = {
  id: "multiplication-race", title: "Multiplication Race", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quick multiplication flashcards. 20 questions; 60-second clock.",
  howToPlay: `Multiplication Race tests how fluent your times tables are. You have 60 seconds to power through up to 20 multiplication flashcards. Each card shows two factors between 2 and 12, like "8 × 7 = ?" with four numeric choices. Click the correct answer to score 10 points and immediately roll into the next problem.

The number range matches what most students drill from second grade through fifth grade — single-digit and low double-digit factors, products from 4 up through 144. The wrong choices sit close to the right answer, so you can't simply spot the largest or smallest number; you have to actually do the multiplication.

Wrong picks don't penalize your score, but they cost you precious time. The clock counts down in red at the top. When time runs out or you complete all 20 questions, your score is locked in.

Maximum is 200 points. Solid runs land near 130-160. Internalize those tables and chase a perfect score!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MultiplicationRaceSettings),
  reducer, isTerminal, hint: (state: MultiplicationRaceState): HintTarget | null => (state.phase !== "done" ? { selector: ".mr-choice", pulses: 3 } : null), component: MultiplicationRaceGame,
};
