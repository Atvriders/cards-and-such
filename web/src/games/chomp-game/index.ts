import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ChompGameGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ChompGameGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const chompGamePlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "chomp-game",
  title: "Chomp",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Misere grid-eating — last to take the poisoned corner LOSES. Eat vs random CPU.",
  howToPlay: "Chomp is a 1973 combinatorial game by David Gale, played on a rectangular grid representing a chocolate bar. Players take turns eating a square — removing that square and all squares above and to its right. The top-left square is poisoned (a misere condition); the player forced to eat it LOSES. In this 5x5 grid adaptation, the chocolate bar mechanic is preserved.\n\nThe board starts entirely filled with P chocolate pieces. Click any P piece to eat it AND every P piece above and to its right (cells with smaller row index AND larger-or-equal column index). The poisoned corner is at row 0, column 0 (top-left). After your turn, a random CPU eats a random remaining piece (and everything above-right of it).\n\nGameplay lasts up to 12 moves or until only the poison square remains. You earn 100 points if the CPU is forced to eat the poison square last, 25 for a draw, 0 if you accidentally eat poison first, plus 5 bonus per remaining P piece. Strategic eating leaves the CPU with awkward boards.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".chp-board")) ? { selector: ".chp-board", pulses: 3 } : null,
  component: ChompGameGame,
};
