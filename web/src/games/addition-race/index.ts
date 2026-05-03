import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AdditionRaceState, AdditionRaceAction, AdditionRaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AdditionRaceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AdditionRaceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const additionRacePlugin: GamePlugin<AdditionRaceState, AdditionRaceAction, typeof settings> = {
  id: "addition-race", title: "Addition Race", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quick addition flashcards. 20 questions; 60-second clock.",
  howToPlay: `Addition Race is a fast-paced mental-math sprint. You have 60 seconds to answer up to 20 addition flashcards. Each card shows a sum like "27 + 18 = ?" with four numeric choices. Pick the correct answer to score 10 points and immediately advance to the next card.

Wrong answers don't penalize you, but they cost time — and time is your real opponent. The clock counts down in red at the top of the screen; when it reaches zero or you complete all 20 questions, the game ends and your final score is locked in.

Operands range from 1 to 50 and the answers can climb to roughly 100. The wrong choices are clustered close to the right answer, so a quick glance is rarely enough — actually do the math. Speed plus accuracy is the formula.

Maximum score is 200 points (20 correct x 10). A typical solid run lands near 120-150. Sharpen those mental-math reflexes and chase a perfect score!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AdditionRaceSettings),
  reducer, isTerminal, hint: (state: AdditionRaceState): HintTarget | null => (state.phase !== "done" ? { selector: ".mr-choice", pulses: 3 } : null), component: AdditionRaceGame,
};
