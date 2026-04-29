import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BowlingCandlepinGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "8", "10"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const bowlingCandlepinPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "bowling-candlepin",
  title: "Candlepin Bowling",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Narrow-pin bowling quiz.",
  howToPlay: "Candlepin Bowling is a multiple-choice puzzle game built around the rules and skill considerations of narrow-pin bowling quiz. Each round shows a prompt that describes a real situation, score, or rule scenario, and you must pick the best answer from four candidates.\n\nRead the prompt at the top of the screen carefully — it often references specific rule mechanics or score states from the underlying skill game. The four answer buttons each show a candidate response, but only one of them is the textbook-correct call. Tap the option you believe is correct so it highlights, then press Submit to lock in your guess for the round.\n\nCorrect answers earn 100 points and turn the chosen button green. Wrong answers turn red, while the true answer is always revealed so you can learn from each round. Press Next to advance through the bank of puzzles drawn for your session.\n\nIn Settings you can choose how many rounds to play in a single session: 5 for a quick warm-up, 8 for a steady challenge, or 10 for a full sprint through the puzzle bank. Puzzle order is seeded for repeatable runs.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: BowlingCandlepinGame,
};
