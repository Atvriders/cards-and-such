import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const martianChessPyramidsPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "martian-chess-pyramids",
  title: "Martian Chess (Pyramids)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pyramid-stack chess by Andy Looney.",
  howToPlay: "Martian Chess uses Looney Labs pyramid pieces on an 8x8 board where pieces don't belong to a colour — they belong to whoever controls the quadrant they sit in. In this 5x5 placement adaptation across 14 turns (7 each), you place pyramids on the grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Martian Chess has pawns, drones, queens (small, medium, large pyramids) with chess-like moves. The 'pieces transfer ownership when they cross quadrant lines' rule is one of the most original ideas in modern abstracts. Looney Labs' Icehouse pyramid system supports many games — Volcano, Homeworlds, Treehouse, Zendo. Strategy: spread placements across the board. Final scoreboard: 100 points for the win, 25 for a tie. Real Martian Chess is rich enough for serious tournament play; this version provides quick board-counting matches.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer, isTerminal, hint: (state: AbsState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: AbsGame,
};
