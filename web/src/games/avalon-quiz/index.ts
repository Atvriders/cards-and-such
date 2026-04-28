import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AvalonQuizState, AvalonQuizAction, AvalonQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AvalonQuizGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const avalonQuizPlugin: GamePlugin<AvalonQuizState, AvalonQuizAction, typeof settings> = {
  id: "avalon-quiz",
  title: "Avalon Strategy Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on Resistance: Avalon's roles and Arthurian deduction.`,
  howToPlay: `Resistance: Avalon Strategy Quiz tests your mastery of the Arthurian-themed Resistance variant. Avalon adds named special roles — Merlin, Percival, Morgana, Mordred, Oberon, the Assassin — that turn each game into a layered information puzzle.

Across 10 multiple-choice questions you'll explore: which roles see which others, how Merlin must hide while still steering the team, why Percival can be confused, the Assassin's endgame kill, and how Mordred / Oberon disrupt the standard knowledge structure.

Each correct answer is 100 points (1000 max). The right answer is revealed each round so you can build intuition.

Topics include: standard role lineups by player count, how Mordred is hidden from Merlin, when Percival should out themselves, optimal Merlin behaviour, and why Avalon games often hinge on a successful or failed Assassin shot.

Tips: Merlin's job is to lose information by approving "obvious" teams without leading. Percival's job is to give Merlin cover. Spies hunt Merlin by clocking who consistently steers without explanation.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AvalonQuizSettings),
  reducer,
  isTerminal,
  component: AvalonQuizGame,
};
