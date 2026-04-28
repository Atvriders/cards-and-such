import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EruditMiniState, EruditMiniAction, EruditMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EruditMiniGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "8", "10"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const eruditMiniPlugin: GamePlugin<EruditMiniState, EruditMiniAction, typeof settings> = {
  id: "erudit-mini",
  title: "Erudit Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Russian Scrabble style: pick the word that fits the rack.",
  howToPlay: "Erudit Mini is a multiple-choice word puzzle inspired by Erudit. Each round presents you with a clue or prompt, and you must pick the correct word from four candidate answers.\n\nRussian Scrabble style: pick the word that fits the rack. Read the prompt at the top of the screen carefully. The four answer buttons each show a candidate word — only one of them satisfies the prompt. Tap the option you believe is correct so it highlights in blue, then press Submit to lock it in.\n\nCorrect answers earn 100 points and turn the chosen button green. Wrong answers turn red, but the correct word is always revealed so you can learn from each round. Press Next to advance through the bank of puzzles drawn for your session.\n\nIn the Settings menu you can choose how many rounds to play in a single session: 5 for a quick warm-up, 8 for a steady challenge, or 10 for a full sprint through the puzzle bank. Puzzle order is fully seeded so the same seed always produces the same playthrough — handy for sharing identical challenges with friends. Aim for a perfect run!",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EruditMiniSettings),
  reducer,
  isTerminal,
  component: EruditMiniGame,
};
