import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { pinpointClueState, pinpointClueAction, pinpointClueSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const pinpointClueGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.pinpointClueGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pinpointCluePlugin: GamePlugin<pinpointClueState, pinpointClueAction, typeof settings> = {
  id: "pinpoint-clue",
  title: "Pinpoint",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess the category from progressively obvious clues, fifteen rounds.",
  howToPlay: "Pinpoint is a category-guessing game distilled to fifteen single-category rounds. Each round presents a series of progressively-obvious clues and asks you to identify the matching category from four options.\n\nThe pool of category-clue chains includes Apple Microsoft Google (Tech Companies), Beethoven Mozart Bach (Composers), Spaghetti Lasagna Risotto (Italian Foods), Shakespeare Hemingway Twain (Authors), Honda Toyota Ford (Car Brands), and other progressive-clue chains. Each correct answer scores ten points; max 150.\n\nClick a category, press Submit to lock, then Next to advance. The original Pinpoint is a five-clue progressive guessing game from LinkedIn News; this distillation preserves the category-recognition aspect without the daily five-step reveal. Quick thinkers score 130+; category-instinct experts hit perfect 150.\n\nUse it as a quick category-recognition drill or a coffee-break brainteaser. Read the cluster of three clues, identify the binding theme, and pick.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as pinpointClueSettings),
  reducer,
  isTerminal,
  
  hint: (state: pinpointClueState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-pinpoint-clue-answer-0"]', pulses: 3 } : null,component: pinpointClueGame,
};
