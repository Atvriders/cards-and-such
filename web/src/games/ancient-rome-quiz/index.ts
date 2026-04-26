import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AncientRomeQuizState, AncientRomeQuizAction, AncientRomeQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AncientRomeQuizGame } from "./Game.js";

const settings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5","10","15"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const ancientRomeQuizPlugin: GamePlugin<AncientRomeQuizState, AncientRomeQuizAction, typeof settings> = {
  id: "ancient-rome-quiz",
  title: "Ancient Rome Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of ancient Roman history, emperors, legions, and culture.",
  howToPlay: `Ancient Rome Quiz tests how well you know one of history's greatest civilisations. Each round you see a question about Rome — covering emperors, battles, culture, engineering, language, and religion — and four possible answers. Tap the one you believe is correct.

After you select, the right answer turns green. If you picked wrong, your choice turns red and the correct answer is revealed. Press Next to continue to the following question.

Each correct answer earns 10 points. At the end of the quiz your total score is shown. Choose 5, 10, or 15 questions in Settings.

Topics include: the founding of Rome, the Republic and Empire, famous emperors like Augustus, Hadrian, and Nero, legendary generals like Hannibal and Scipio, famous structures like the Colosseum and aqueducts, Roman gods, Latin, currency, and great battles.

Tips: SPQR is a key abbreviation to know. Julius Caesar was never emperor — Octavian (Augustus) was the first. The Tiber flows through Rome. Vesta was the goddess of the hearth. Study these and you will top the leaderboard!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AncientRomeQuizSettings),
  reducer,
  isTerminal,
  component: AncientRomeQuizGame,
};
