import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SubtractionRaceState, SubtractionRaceAction, SubtractionRaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SubtractionRaceGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const subtractionRacePlugin: GamePlugin<SubtractionRaceState, SubtractionRaceAction, typeof settings> = {
  id: "subtraction-race", title: "Subtraction Race", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quick subtraction flashcards. 20 questions; 60-second clock.",
  howToPlay: `Subtraction Race is a fast-paced mental-math sprint. You have 60 seconds to answer up to 20 subtraction flashcards. Each card shows a difference like "73 − 28 = ?" with four numeric choices. Tap the correct answer to score 10 points and instantly move on.

The minuend (left number) ranges from 20 up to 100, and the subtrahend (right number) is always smaller, so answers stay non-negative. Wrong choices are clustered close to the right answer, so you actually have to do the math — guessing won't fly.

The clock at the top counts down in red. When it hits zero or you finish all 20 questions, your score locks in. There's no penalty for wrong answers other than the time you wasted clicking. Keep your eyes scanning ahead — the moment you click, the next problem appears.

Maximum score is 200 points (20 correct x 10). Average runs land near 100-150. Sharpen your subtraction reflexes and chase that perfect 200!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SubtractionRaceSettings),
  reducer, isTerminal, component: SubtractionRaceGame,
};
