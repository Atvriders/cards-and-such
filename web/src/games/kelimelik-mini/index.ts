import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KelimelikMiniState, KelimelikMiniAction, KelimelikMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KelimelikMiniGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "8", "10"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const kelimelikMiniPlugin: GamePlugin<KelimelikMiniState, KelimelikMiniAction, typeof settings> = {
  id: "kelimelik-mini",
  title: "Kelimelik Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Turkish words-with-friends style: pick the highest scoring word.",
  howToPlay: "Kelimelik Mini is a multiple-choice word puzzle inspired by Kelimelik. Each round presents you with a clue or prompt, and you must pick the correct word from four candidate answers.\n\nTurkish words-with-friends style: pick the highest scoring word. Read the prompt at the top of the screen carefully. The four answer buttons each show a candidate word — only one of them satisfies the prompt. Tap the option you believe is correct so it highlights in blue, then press Submit to lock it in.\n\nCorrect answers earn 100 points and turn the chosen button green. Wrong answers turn red, but the correct word is always revealed so you can learn from each round. Press Next to advance through the bank of puzzles drawn for your session.\n\nIn the Settings menu you can choose how many rounds to play in a single session: 5 for a quick warm-up, 8 for a steady challenge, or 10 for a full sprint through the puzzle bank. Puzzle order is fully seeded so the same seed always produces the same playthrough — handy for sharing identical challenges with friends. Aim for a perfect run!",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KelimelikMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: KelimelikMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-kelimelik-mini-answer-0"]', pulses: 3 } : null,component: KelimelikMiniGame,
};
