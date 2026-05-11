import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { fogOfLoveCoopState, fogOfLoveCoopAction, fogOfLoveCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const fogOfLoveCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.fogOfLoveCoopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fogOfLoveCoopPlugin: GamePlugin<fogOfLoveCoopState, fogOfLoveCoopAction, typeof settings> = {
  id: "fog-of-love-coop",
  title: "Fog of Love",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Romantic cooperative narrative — work toward shared goals together for ten rounds.",
  howToPlay: "Fog of Love is a romantic cooperative narrative game distilled to ten dice rounds. You and your AI partner are a couple navigating ten chapters of relationship together — each round adds happiness points to your shared bond.\n\nEach round, press Play Round. Both partners roll simultaneously and the sum (2-12) joins your relationship score. Press Next Round to advance, Finish on round ten.\n\nThe target relationship score is 70 — reach it for a +50 Happily Ever After bonus. Fall short and the relationship hits foggy patches but doesn't end on a downer; just no bonus.\n\nThe original Fog of Love is a story-driven two-player relationship game with personality cards, scenes, and ending decisions. This distillation captures only the cooperative score-accumulation through ten chapters; the narrative depth lives in your imagination.\n\nA balanced romance scores around 70; a passionate run hits 80+; a rocky one limps to 60. Keep rolling, keep loving, and let the dice determine if you make it through chapter ten with the bonus intact.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as fogOfLoveCoopSettings),
  reducer, isTerminal, hint: (state: fogOfLoveCoopState): HintTarget | null => ((state.phase === "ready" || state.phase === "rolled") ? { selector: ".coop-btn", pulses: 3 } : null), component: fogOfLoveCoopGame,
};
