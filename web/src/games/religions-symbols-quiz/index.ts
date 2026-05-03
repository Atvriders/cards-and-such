import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReligionsSymbolsQuizState, ReligionsSymbolsQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ReligionsSymbolsQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ReligionsSymbolsQuiz as unknown as React.ComponentType<unknown> })));
export const religionsSymbolsQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof religionsSymbolsQuizSettings>;

export const religionsSymbolsQuizPlugin: GamePlugin<ReligionsSymbolsQuizState, ReligionsSymbolsQuizAction, typeof religionsSymbolsQuizSettings> = {
  id: "religions-symbols-quiz",
  title: "Religions & Symbols Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match religious symbols to their faith tradition — from the cross to the Om.",
  howToPlay: `Religions and Symbols Quiz asks you to match sacred symbols and icons to their correct faith tradition. Each question describes a religious symbol — its appearance, origin, or meaning — and presents four possible religions or traditions.

Select the correct faith to earn 10 points. Correct answers show in green; wrong ones in red with the right answer revealed. Press Next to continue.

The quiz covers major world religions including Christianity, Islam, Judaism, Hinduism, Buddhism, Sikhism, Zoroastrianism, Shinto, Jainism, and Taoism, as well as ancient and neo-pagan traditions.

Choose 5, 10, or 15 questions per session to match your time and interest.

Tips: Many iconic symbols have unique visual signatures that hint strongly at their religion — the crescent for Islam, the cross for Christianity, the wheel for Buddhism. For less familiar symbols, think about the geographic origin of the religion: Torii gates are Japanese (Shinto), Faravahar is Persian (Zoroastrianism). When a symbol appears in multiple traditions, the question will usually provide context clues like a specific country or ceremony to narrow it down.`,
  settings: religionsSymbolsQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: ReligionsSymbolsQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: ReligionsSymbolsQuiz,
};
