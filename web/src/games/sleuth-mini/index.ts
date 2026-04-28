import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SleuthMiniState, SleuthMiniAction, SleuthMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SleuthMiniGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const sleuthMiniPlugin: GamePlugin<SleuthMiniState, SleuthMiniAction, typeof settings> = {
  id: "sleuth-mini",
  title: "Sleuth Strategy Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on Sid Sackson's Sleuth gem deduction classic.`,
  howToPlay: `Sleuth Strategy Quiz tests your knowledge of Sid Sackson's 1971 deduction classic. Players ask each other questions about a hidden "lost gem" using a specialized question deck that constrains how much information each query yields.

Across 10 multiple-choice questions you'll cover: how the gem cards encode color, type, and quantity; how question cards limit your queries; the importance of bookkeeping on the score sheet; and why Sleuth is often called the gold-standard deduction game by serious gamers.

Each correct answer awards 100 points (1000 max).

Tips: in Sleuth the question deck is small and shared — track which cards have been used to constrain opponents' future questions. Always ask questions whose answers narrow the gem set, not ones that confirm what you already know. The hardest skill is reading what your opponents must already know based on which questions they've asked.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SleuthMiniSettings),
  reducer,
  isTerminal,
  component: SleuthMiniGame,
};
