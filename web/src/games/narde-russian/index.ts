import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NardeState, NardeAction, NardeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NardeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NardeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const nardeRussianPlugin: GamePlugin<NardeState, NardeAction, typeof settings> = {
  id: "narde-russian",
  title: "Narde (Russian Backgammon)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Russian Backgammon — race pieces around a board. Place vs random CPU.",
  howToPlay: "Narde is the Russian Backgammon family — including variants like Long Nardy played in Russia, Armenia, and Central Asia. Both players move pieces in the same direction around the board (counterclockwise) rather than the opposite directions used in Western Backgammon. In this compact 6x6 grid placement adaptation, the directional race spirit is preserved through zone-based scoring.\n\nClick any empty cell to place a P piece. Cells are weighted: bottom rows are worth fewer points, top rows are worth more (counterclockwise spiral). The further along the race-direction your placement, the more points. After your turn, a random CPU places a C piece on a random empty cell, scoring symmetrically (clockwise from bottom).\n\nGameplay lasts up to 20 moves or until the board fills. You earn 100 points if your race-score exceeds the CPU's, 25 for a tie, plus your race-score. The race-direction asymmetry rewards aggressive placement in the high-value top rows early before the CPU can claim those cells.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NardeSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".narde-movebtn", pulses: 3 }; },
  component: NardeGame,
};
