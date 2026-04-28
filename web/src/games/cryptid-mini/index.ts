import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CryptidMiniState, CryptidMiniAction, CryptidMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CryptidMiniGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const cryptidMiniPlugin: GamePlugin<CryptidMiniState, CryptidMiniAction, typeof settings> = {
  id: "cryptid-mini",
  title: "Cryptid Strategy Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on Cryptid's hex-tile cryptid-hunting deduction.`,
  howToPlay: `Cryptid Strategy Quiz tests your knowledge of the 2018 hidden-info game by Hal Duncan and Ruth Veevers. Each player has a unique terrain-or-feature clue about where the legendary cryptid hides on a hex map; players take turns asking questions to narrow the location.

Across 10 multiple-choice questions you'll cover: how clue cards work (positive vs. negative), the question / search action loop, why disagreement on a search reveals information, the role of structures (standing stone, abandoned shack), and the deduction logic that makes Cryptid feel like a logic puzzle disguised as a board game.

Each correct answer is 100 points (1000 max).

Tips: in Cryptid, the most informative move is often a "search" on a hex you've already triangulated — opponents either confirm or deny, narrowing the cryptid's hex one quadrant at a time. Negative-clue cards are notoriously hard to read; track every disc placement.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CryptidMiniSettings),
  reducer,
  isTerminal,
  component: CryptidMiniGame,
};
