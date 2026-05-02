import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ComposersQuizState, ComposersQuizAction, ComposersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ComposersQuiz } from "./Game.js";

const composersQuizPluginSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type ST = SettingsOf<typeof composersQuizPluginSettings>;

export const composersQuizPlugin: GamePlugin<ComposersQuizState, ComposersQuizAction, typeof composersQuizPluginSettings> = {
  id: "composers-quiz",
  title: "Composers Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of classical composers and their masterworks — from Bach and Mozart to Stravinsky and Gershwin.",
  howToPlay: `Composers Quiz challenges your knowledge of music history's greatest creators. Questions cover famous symphonies, operas, and concertos; composers' nationalities and life stories; musical periods from Baroque to Modernist; and surprising facts about how the world's greatest music was made.

You have 15 seconds per question. Correct answers earn 100 base points plus a speed bonus of 10 points per second remaining. Fast accurate answers maximize your score.

Click a choice to select it, then press Submit. The correct answer highlights green; wrong choices turn red. Press Next to continue.

Choose 10, 20, or 30 questions in Settings. Questions cover composers from Vivaldi and Handel to Gershwin and Puccini.

Score and accuracy are displayed at the end. Whether you are a concert-goer or simply love great music, Composers Quiz will fine-tune your knowledge!`,
  settings: composersQuizPluginSettings,
  initialState: (seed: number, s: ST) => initialState(seed, s as ComposersQuizSettings),
  reducer, isTerminal, 
  hint: (state: ComposersQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: ComposersQuiz,
};
