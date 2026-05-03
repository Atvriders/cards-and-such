import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf , HintTarget} from "../../platform/game-plugin/types.js";
import type { DobbleEuropeanState, DobbleEuropeanAction, DobbleEuropeanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DobbleEuropeanGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DobbleEuropeanGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const dobbleEuropeanPlugin: GamePlugin<DobbleEuropeanState, DobbleEuropeanAction, typeof settings> = {
  id: "dobble-european",
  title: "Dobble European",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "European Spot It variant.",
  howToPlay: "Dobble European is a memory and observation challenge built around quick recall. Each of fifteen rounds shows a brief prompt referencing one item from a fixed pool of cards, and asks you to pick the matching name from four candidates. Correct answers earn ten points (max 150), and the answer is revealed each round so you can learn the pool over time.\n\nThe game pool is fixed — every round draws from the same set of items, so as you play you build familiarity. Read the prompt carefully; the cue may describe a visual feature, a category, or a trait. Click your answer, then Submit to lock, then Next to advance. Wrong picks show the correct answer in green and your guess in red. There is no time pressure, so take a moment to scan options before committing.\n\nStrong scores are 130+; perfect 150 requires careful attention to detail. Use this game to train pattern recognition, observational accuracy, and memory association — skills that transfer to all matching, recall, and trivia games. Good luck!",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DobbleEuropeanSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".dobeurp-wrap")) ? { selector: ".dobeurp-wrap", pulses: 3 } : null,
  component: DobbleEuropeanGame,
};
