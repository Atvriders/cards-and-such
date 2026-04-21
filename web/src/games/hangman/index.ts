import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HangmanState, HangmanAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Hangman } from "./Hangman.js";

export const hangmanSettings = {
  wordLength: {
    kind: "enum" as const,
    label: "Word length",
    options: ["any", "short", "medium", "long"] as const,
    default: "any" as const,
  },
  maxWrong: {
    kind: "enum" as const,
    label: "Max wrong",
    options: ["6", "8", "10"] as const,
    default: "6" as const,
  },
} as const;

type HangmanSettingsType = SettingsOf<typeof hangmanSettings>;

export const hangmanPlugin: GamePlugin<HangmanState, HangmanAction, typeof hangmanSettings> = {
  id: "hangman",
  title: "Hangman",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess the hidden word letter by letter before the hangman is complete.",
  settings: hangmanSettings,
  initialState: (seed: number, settings: HangmanSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Hangman,
};
