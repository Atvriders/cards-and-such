import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpanishDraughtsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpanishDraughtsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const spanishDraughtsPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "spanish-draughts",
  title: "Spanish Draughts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spanish Checkers ruleset — diagonal moves. Place vs random CPU.",
  howToPlay: "Spanish Draughts (Damas Espanolas) is the classical Spanish variant of Checkers, played on an 8x8 dark-squared board with backward-capture flying kings. Long captures and majority-capture rules distinguish Spanish play from English Checkers. In this compact placement-style adaptation, those mechanics are streamlined for quick games.\n\nClick any empty cell to place a P piece. If your new P piece sits diagonally adjacent to an isolated C piece (no friendly C protector behind it), that C is captured and removed. Then a random CPU places a C piece that may symmetrically capture exposed P pieces.\n\nGameplay lasts up to 20 moves or until a side runs out of pieces. You earn 100 points for eliminating all CPU pieces, 50 for ending with more pieces than the CPU, 25 for a tie, and 5 bonus points per surviving P piece. Spanish play traditionally values long captures and central control. Try to place pieces that simultaneously threaten multiple isolated CPU pieces along open diagonals to maximize your capture rate.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".spd-board")) ? { selector: ".spd-board", pulses: 3 } : null,
  component: SpanishDraughtsGame,
};
