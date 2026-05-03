import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReligionsQuizState, ReligionsQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ReligionsQuiz = /* @__PURE__ */ lazy(() => import("./ReligionsQuiz.js").then((mod) => ({ default: mod.ReligionsQuiz as unknown as React.ComponentType<unknown> })));
export const religionsQuizSettings = { questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof religionsQuizSettings>;
export const religionsQuizPlugin: GamePlugin<ReligionsQuizState, ReligionsQuizAction, typeof religionsQuizSettings> = {
  id: "religions-quiz", title: "Religions Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of world religions, their texts, founders, and practices.",
  howToPlay: `Religions Quiz challenges your understanding of the major world faiths and their traditions. Questions cover holy texts, founding figures, key beliefs, geographic origins, and religious practices. Select the correct answer from four options; correct answers turn green and incorrect ones turn red. Earn 10 points per correct answer, with 5, 10, or 15 questions per session. Topics include Christianity, Islam, Hinduism, Buddhism, Judaism, Sikhism, Taoism, Confucianism, Zoroastrianism, and Shinto. Tips: Link religions to their home regions — Hinduism and Buddhism to the Indian subcontinent, Confucianism and Taoism to China, Shinto to Japan. Key texts: Bible for Christianity, Quran for Islam, Torah for Judaism, Vedas for Hinduism.`,
  settings: religionsQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer, isTerminal, hint: (state: ReligionsQuizState): HintTarget | null => !state.done ? { selector: '.sq-choices', pulses: 3 } : null, component: ReligionsQuiz,
};
