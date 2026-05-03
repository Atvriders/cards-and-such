import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AncientEgyptQuizState, AncientEgyptQuizAction, AncientEgyptQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AncientEgyptQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AncientEgyptQuizGame as unknown as React.ComponentType<unknown> })));
const settings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5","10","15"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const ancientEgyptQuizPlugin: GamePlugin<AncientEgyptQuizState, AncientEgyptQuizAction, typeof settings> = {
  id: "ancient-egypt-quiz",
  title: "Ancient Egypt Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of ancient Egyptian pharaohs, pyramids, gods, and culture.",
  howToPlay: `Ancient Egypt Quiz challenges you on one of the world's oldest civilisations. Questions span pharaohs, pyramids, hieroglyphics, gods, mummification, and daily life along the Nile. Each question offers four choices — select the one you think is correct.

After choosing, the correct answer is revealed in green. A wrong pick turns red. Press Next to move on.

Each correct answer scores 10 points. Your total appears at the end of the quiz. Choose 5, 10, or 15 questions in Settings.

Key topics: the Great Pyramid, pharaohs such as Ramesses II, Hatshepsut, and Tutankhamun, gods like Ra, Osiris, and Isis, the Rosetta Stone, mummification, papyrus, and the all-important Nile flood cycle.

Tips: Akhenaten introduced monotheism; Tutankhamun was the boy pharaoh found in 1922; the Rosetta Stone unlocked hieroglyphics. Remember that Anubis guided souls but Osiris judged them. Master these key facts and you will ace every round!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AncientEgyptQuizSettings),
  reducer,
  isTerminal,
  hint: (state: AncientEgyptQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: AncientEgyptQuizGame,
};
