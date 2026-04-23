import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TriviaState, TriviaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GeneralTrivia } from "./Game.js";

export const generalTriviaSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "50"] as const,
    default: "10" as const,
  },
  category: {
    kind: "enum" as const,
    label: "Category",
    options: ["mixed", "history", "science", "geography", "arts", "sports"] as const,
    default: "mixed" as const,
  },
} as const;

type GeneralTriviaSettingsType = SettingsOf<typeof generalTriviaSettings>;

export const generalTriviaPlugin: GamePlugin<TriviaState, TriviaAction, typeof generalTriviaSettings> = {
  id: "general-trivia",
  title: "General Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Multiple-choice trivia across history, science, geography, arts, and sports. Answer quickly to earn bonus points.",
  howToPlay: `General Trivia tests your knowledge across five categories: history, science, geography, arts, and sports. Each question presents four multiple-choice answers — pick the one you believe is correct.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points for every second remaining on the clock. So if you answer in 3 seconds you bank 100 + 120 = 220 points, but waiting until the last second earns only 100 + 10 = 110. Wrong answers score zero.

Click a choice to highlight it, then press Submit (or let the timer run out). After submitting you see which answer was correct in green, and your wrong pick highlighted in red. Click Next to move on.

Settings let you choose how many questions to answer (10, 20, or 50) and whether to focus on a specific category or play a mixed set. The category badge on each card shows which domain the question came from.

At the end you see your total score and how many you got right. Aim to answer fast and correctly — the biggest scores go to players who are both knowledgeable and quick on the draw.`,
  settings: generalTriviaSettings,
  initialState: (seed: number, settings: GeneralTriviaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: GeneralTrivia,
};
