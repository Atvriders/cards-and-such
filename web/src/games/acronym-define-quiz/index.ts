import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcronymDefineQuizState, AcronymDefineQuizAction, AcronymDefineQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AcronymDefineQuizGame } from "./Game.js";
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const acronymDefineQuizPlugin: GamePlugin<AcronymDefineQuizState, AcronymDefineQuizAction, typeof settings> = {
  id: "acronym-define-quiz", title: "Acronym Define Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify what well-known English acronyms stand for.",
  howToPlay: `Acronym Define Quiz tests your knowledge of well-known acronyms — words formed from initial letters. Each question gives an acronym and asks what it spells out.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Acronyms power modern communication: 'NASA', 'ASAP', 'SCUBA', 'LASER', 'FOMO'. Knowing the source phrases helps comprehension and shows where everyday English came from. Whether prepping vocabulary or just curious, Acronym Define Quiz keeps you thinking. Score points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AcronymDefineQuizSettings),
  reducer, isTerminal, 
  hint: (state: AcronymDefineQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: AcronymDefineQuizGame,
};
