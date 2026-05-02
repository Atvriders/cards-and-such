import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TreatiesQuizState, TreatiesQuizAction, TreatiesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TreatiesQuiz } from "./Game.js";

const treatiesQuizPluginSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type ST = SettingsOf<typeof treatiesQuizPluginSettings>;

export const treatiesQuizPlugin: GamePlugin<TreatiesQuizState, TreatiesQuizAction, typeof treatiesQuizPluginSettings> = {
  id: "treaties-quiz",
  title: "Treaties Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of famous historical treaties and international agreements that shaped borders, peace, and global order.",
  howToPlay: `Treaties Quiz challenges your knowledge of the diplomatic agreements that defined borders and ended conflicts throughout history. Questions cover peace treaties, trade agreements, environmental accords, arms control treaties, and the alliances that shaped the modern world order.

You have 15 seconds per question. Correct answers earn 100 base points plus a speed bonus of 10 points per second remaining. Fast accurate answers maximize your score.

Click a choice to select it, then press Submit. The correct answer highlights green; wrong choices turn red. Press Next to continue.

Choose 10, 20, or 30 questions in Settings. Questions range from the Treaty of Westphalia to the Paris Agreement and beyond.

Score and accuracy are displayed at the end. Whether you study diplomacy or just love history, Treaties Quiz will broaden your global perspective!`,
  settings: treatiesQuizPluginSettings,
  initialState: (seed: number, s: ST) => initialState(seed, s as TreatiesQuizSettings),
  reducer, isTerminal, 
  hint: (state: TreatiesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: TreatiesQuiz,
};
