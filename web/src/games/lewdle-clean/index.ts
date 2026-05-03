import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LewdleCleanState, LewdleCleanAction, LewdleCleanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LewdleCleanGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LewdleCleanGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const lewdleCleanPlugin: GamePlugin<LewdleCleanState, LewdleCleanAction, typeof settings> = {
  id: "lewdle-clean", title: "Lewdle Clean", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Themed-Wordle clone-quiz. Identify the answer word from emoji clues.",
  howToPlay: "Lewdle Clean is a family-friendly nod to the themed-Wordle clones (Lewdle, Nerdle, Lordle, Gordle, etc.). Each round provides a casual descriptive emoji-style clue and asks which five-letter answer word matches. Twelve rounds, ten points each, total 120 points. We've kept the answer pool to clean five-letter words — fruits, animals, simple verbs, and common objects. The point of themed Wordles is that the daily answer comes from a curated dictionary, dramatically narrowing what valid guesses look like. So this quiz tests whether you can predict the curated answer space from a quick clue. Sharp Wordle players who guess from category-fitness rather than letter-frequency tend to nail 100+; casual word-fans aim for 60-70. Submit, Next, finish in under three minutes. A pleasant warm-up to playing real Wordle clones online — and a reminder that themed Wordle answers always live in their theme.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LewdleCleanSettings),
  reducer, isTerminal, hint: (state: LewdleCleanState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-lewdle-clean-answer-0"]', pulses: 3 } : null, component: LewdleCleanGame,
};
