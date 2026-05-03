import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ObserverCardState, ObserverCardAction, ObserverCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ObserverCardGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ObserverCardGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const observerCardPlugin: GamePlugin<ObserverCardState, ObserverCardAction, typeof settings> = {
  id: "observer-card", title: "Observer Card", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Study the scene then answer detail questions.",
  howToPlay: "Observer Card brings Sherlock-style observation to a card game. Each of ten rounds presents a six-icon scene displayed for 3.5 seconds — typical icons include houses, cars, animals, weather, and plants. After the scene fades, a question asks whether a specific element was present. Pick the YES or NO answer from four choices (two distractors keep you reading). Correct picks score ten points; max 100 total across the ten rounds. The icon pool spans 24 illustrations covering urban, rural, weather, and emotional themes. Observer Card trains noticing — the skill of registering what is in front of you without filtering. Detective-fiction fans love it as a warm-up for deeper logic puzzles. Strong players score 80+; visual-memory aces 100. Each round is independent — you cannot carry over notes from previous scenes. Hit Submit to lock your guess, Next to advance. Total run takes about two minutes total.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ObserverCardSettings),
  reducer, isTerminal, hint: (state: ObserverCardState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-observer-card-answer-0"]', pulses: 3 } : null, component: ObserverCardGame,
};
