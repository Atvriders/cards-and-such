import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HistoryTrivia } from "./Game.js";

const historyTriviaSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type HistoryTriviaSettingsType = SettingsOf<typeof historyTriviaSettings>;

export const historyTriviaPlugin: GamePlugin<QuizState, QuizAction, typeof historyTriviaSettings> = {
  id: "history-trivia",
  title: "History Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Journey through the ages — ancient civilizations, world wars, empires, revolutions, and the key events that shaped the modern world.",
  howToPlay: `History Trivia takes you on a journey through human history — from ancient civilizations and medieval empires to modern revolutions and world wars. Questions span global history including ancient Greece and Rome, the Renaissance, colonial expansion, the World Wars, the Cold War, and pivotal moments of the 20th century.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining. Quick, confident answers are rewarded most generously.

Click your chosen answer, then press Submit. After answering, the correct choice lights up green while any wrong selection turns red. Click Next to advance.

Choose 10, 20, or 30 questions in Settings to control the session length. Questions are pulled randomly from a bank of 32 historical facts. The difficulty ranges from well-known facts to more nuanced historical details that will challenge even dedicated history buffs.

See your total score and accuracy at the end. Learn something new with every play-through — history is full of surprises!`,
  settings: historyTriviaSettings,
  initialState: (seed: number, settings: HistoryTriviaSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-history-trivia-answer-0"]', pulses: 3 } : null,component: HistoryTrivia,
};
