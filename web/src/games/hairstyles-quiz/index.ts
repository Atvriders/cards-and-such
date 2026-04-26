import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HairstylesQuizState, HairstylesQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HairstylesQuiz } from "./Game.js";

export const hairstylesQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof hairstylesQuizSettings>;

export const hairstylesQuizPlugin: GamePlugin<HairstylesQuizState, HairstylesQuizAction, typeof hairstylesQuizSettings> = {
  id: "hairstyles-quiz",
  title: "Hairstyles Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Can you identify hairstyles from descriptions? From chignons to mohawks, test your hair knowledge.",
  howToPlay: `Hairstyles Quiz tests your knowledge of iconic and everyday hair styles from around the world and throughout history. Each question describes a cut, style, or technique and asks you to identify it from four choices.

Select the answer you think is correct. If right, it lights up green and you score 10 points. If wrong, it turns red while the correct answer is revealed. Hit Next to continue.

Questions range from classic formal styles like chignons and pompadours to modern trends like box braids, undercuts, and space buns. Cultural and historical context is often embedded in the clues.

Choose 5, 10, or 15 questions in settings. A quick 5-question round tests your basics; 15 questions covers everything from the Victorian era to today's TikTok-inspired looks.

Tips: Descriptions mentioning 'coiled', 'twisted', or 'locked' hair tend to point toward protective styles. Words like 'shaved sides' or 'disconnected' suggest modern barbershop cuts. Formal occasion clues often lead to updos and chignons. Country or era hints narrow it down quickly — try to eliminate the most different styles first.`,
  settings: hairstylesQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: HairstylesQuiz,
};
