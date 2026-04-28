import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuperMastermindState, SuperMastermindAction, SuperMastermindSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuperMastermindGame } from "./Game.js";

const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["8"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const superMastermindPlugin: GamePlugin<SuperMastermindState, SuperMastermindAction, typeof settings> = {
  id: "super-mastermind",
  title: "Super Mastermind",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `5-peg 8-color Mastermind: 8 logic puzzles where you pick the secret combo.`,
  howToPlay: `Super Mastermind is the official 5-peg 8-color extension of the classic Mastermind puzzle. Each puzzle gives you the codemaker's two prior trial-and-feedback rows; you must read those clues and pick the unique 5-peg combination consistent with both rows from the answer choices.

Each round shows a scenario, two clue rows, and four candidate codes. Your job is to apply Mastermind logic — count exact-position hits, color-only hits, and rule out any candidate that would generate different feedback than the codemaker received.

Each correct deduction earns 100 points across 8 puzzles for an 800 max. The right answer is revealed each round to teach.

Tips: in real Super Mastermind a 5-peg 8-color code has 32,768 possibilities — even one row of feedback rules out the vast majority. Always cross-check candidates by simulating the feedback they'd generate against the clue rows; the unique consistent candidate is the answer.

Watch for distractors that match one row's feedback but contradict the other — those are the wrong answers.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SuperMastermindSettings),
  reducer,
  isTerminal,
  component: SuperMastermindGame,
};
