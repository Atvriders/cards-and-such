import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenStudHiLoState, SevenStudHiLoAction, SevenStudHiLoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenStudHiLoGame } from "./Game.js";

const settings = {
  startingBankroll: { kind: "enum" as const, label: "Starting Stack", options: ["500", "1000", "5000"] as const, default: "1000" },
  ante: { kind: "enum" as const, label: "Ante", options: ["5", "10", "25"] as const, default: "10" },
} as const;
type S = SettingsOf<typeof settings>;

export const sevenStudHiLoPlugin: GamePlugin<SevenStudHiLoState, SevenStudHiLoAction, typeof settings> = {
  id: "seven-stud-hi-lo",
  title: "7-Card Stud Hi-Lo",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up 7-Card Stud 8-or-Better: split pot between best high and qualifying low.",
  howToPlay:
    "7-Card Stud Hi-Lo splits the pot between best high hand and best A-5 low (8-or-better). Each player receives 7 cards over 5 streets:\n\n- 3rd street: 2 down + 1 up (door card)\n- 4th, 5th, 6th street: 1 up each\n- 7th street (river): 1 down\n\nBest 5 of your 7 for high; if a qualifying low (5 cards 8 or below, no pair) exists, half the pot goes to the best low. Different cards may be used for each half.\n\nUse Fold/Check/Call/Raise.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenStudHiLoSettings),
  reducer,
  isTerminal,
  component: SevenStudHiLoGame,
};
