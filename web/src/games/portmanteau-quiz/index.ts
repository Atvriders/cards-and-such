import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PortmanteauQuizState, PortmanteauQuizAction, PortmanteauQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PortmanteauQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PortmanteauQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind: "enum" as const, label: "Questions", options: ["8", "12"] as const, default: "8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const portmanteauQuizPlugin: GamePlugin<PortmanteauQuizState, PortmanteauQuizAction, typeof settings> = {
  id: "portmanteau-quiz", title: "Portmanteau Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify the two words that combine to form an English portmanteau.",
  howToPlay: `Portmanteau Quiz tests your knowledge of portmanteau words — blends of two source words that produce a new meaningful word. Each question shows a portmanteau and asks which two words it combines.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 8 or 12 questions in Settings.

Portmanteau words are everywhere in modern English: 'brunch' from breakfast and lunch, 'smog' from smoke and fog, 'motel' from motor and hotel. Lewis Carroll coined the term in Through the Looking-Glass. Whether you love etymology or just love wordplay, Portmanteau Quiz is great fun. Score points, learn origins!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PortmanteauQuizSettings),
  reducer, isTerminal, 
  hint: (state: PortmanteauQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: PortmanteauQuizGame,
};
