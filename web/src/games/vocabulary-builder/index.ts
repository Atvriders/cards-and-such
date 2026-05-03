import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VocabularyBuilderState, VocabularyBuilderAction, VocabularyBuilderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VocabularyBuilderGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const vocabularyBuilderPlugin: GamePlugin<VocabularyBuilderState, VocabularyBuilderAction, typeof settings> = {
  id: "vocabulary-builder", title: "Vocabulary Builder", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the correct definition of intermediate-to-advanced English words.",
  howToPlay: `Vocabulary Builder tests your command of intermediate-to-advanced English vocabulary. Each question presents a word and asks you to choose its closest definition from four options. Words range across academic, literary, and everyday vocabulary.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

A strong vocabulary unlocks better reading, more precise writing, and clearer thinking. Whether you are prepping for the SAT, GRE, or just love learning new words, Vocabulary Builder is a reliable daily workout. Build skills, score points, master English!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as VocabularyBuilderSettings),
  reducer, isTerminal, hint: (state: VocabularyBuilderState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-vocabulary-builder-answer-0"]', pulses: 3 } : null, component: VocabularyBuilderGame,
};
