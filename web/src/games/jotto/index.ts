import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { JottoState, JottoAction, JottoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JottoGame } from "./Game.js";

const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["8"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const jottoPlugin: GamePlugin<JottoState, JottoAction, typeof settings> = {
  id: "jotto",
  title: "Jotto",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `Five-letter word-deduction: pick the word that fits all letter-match clues.`,
  howToPlay: `Jotto is the classic word-mastermind by Morton Rosenfeld (1955). One player picks a five-letter secret word; the other guesses and is told only the count of shared letters per guess. After enough guesses the secret word is uniquely determined.

In this solo adaptation, each puzzle gives you 2–3 trial guesses with their letter-match counts. You must select the candidate five-letter word consistent with every count. Eight puzzles per session.

Each correct deduction earns 100 points (800 max). The right answer is revealed each round.

Tips: in real Jotto, focus on letter sets, not orderings — the count tells you only how many letters are shared, not where. Common five-letter words like CRANE, SLATE, AUDIO are great early-guess pools because they cover diverse common letters. As clues accumulate, intersection logic narrows the word fast.

Watch for ambiguity: sometimes two candidates match all clues, but in our puzzles only one is the intended answer.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as JottoSettings),
  reducer,
  isTerminal,
  component: JottoGame,
};
