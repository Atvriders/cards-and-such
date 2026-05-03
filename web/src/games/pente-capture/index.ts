import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PenteCaptureGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PenteCaptureGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const penteCapturePlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "pente-capture",
  title: "Pente",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five-in-a-row with capture rule. Sandwich pairs of opposing pieces. Place vs random CPU.",
  howToPlay: "Pente is a strategy game that adds a unique sandwich-capture rule to the classic five-in-a-row formula. Played on a 7x7 grid in this compact version. Players alternate placing pieces on empty intersections, and there are two ways to win: form an unbroken line of five or more of your pieces, or capture five pairs (10 stones) of opposing pieces.\n\nClick any empty square to place. A pair of opposing stones flanked exactly between two of your pieces is captured and removed. The CPU plays random legal placements. Each capture you make earns extra board space and counts toward your capture goal.\n\nYou earn 100 points for any victory (line or 5 captures), 25 for a draw at move cap, plus 5 bonus points per capture you achieved. Pente rewards aggressive play because each capture both removes opposing material and opens new opportunities. Watch for chains where a single placement triggers multiple captures across different directions, all calculated from the placed stone outward.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".pnt-board")) ? { selector: ".pnt-board", pulses: 3 } : null,
  component: PenteCaptureGame,
};
