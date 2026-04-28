import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { InsiderQuizState, InsiderQuizAction, InsiderQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { InsiderQuizGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const insiderQuizPlugin: GamePlugin<InsiderQuizState, InsiderQuizAction, typeof settings> = {
  id: "insider-quiz",
  title: "Insider Strategy Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on Insider, the hidden-role 20-questions game.`,
  howToPlay: `Insider Strategy Quiz tests your knowledge of Tomoyuki Hayashi's 2016 hidden-role version of 20 Questions. The Master knows the secret word and answers yes/no questions; the Insider also knows the word and tries to subtly guide questioners; everyone else is a Commoner trying to guess the word in the time limit. Once the word is guessed, players debate who the Insider was.

Across 10 multiple-choice questions you'll cover: standard role lineup (Master, Insider, Commoners), the time-limited yes/no question phase, why an Insider must walk a tightrope between guiding and being detected, and how the Master's pacing reveals information.

Each correct answer is 100 points (1000 max).

Tips: Insiders should ask the second-best question, not the best — a perfectly-targeted question reveals knowledge. Commoners should track who asks the most pointed questions toward the end and treat them with suspicion. Master is mostly passive but pacing yes-counts can leak hints.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as InsiderQuizSettings),
  reducer,
  isTerminal,
  component: InsiderQuizGame,
};
