import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const hackenbushEdgesPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "hackenbush-edges",
  title: "Hackenbush (Edges)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Edge-removal graph game by John Conway.",
  howToPlay: "Hackenbush is John Conway's edge-removal graph game from his Combinatorial Game Theory work. In this 5x5 placement adaptation across 14 turns (7 each), you place edge-markers on the grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Hackenbush has a graph (often a stylized 'plant' rooted in the ground) with coloured edges; on each turn a player removes one of their colour's edges, and any edges no longer connected to the ground also fall. The last player able to move wins. Hackenbush is the canonical example used to introduce surreal numbers and infinitesimals in Conway's On Numbers and Games. Strategy in this placement version: contest the central tile. Final scoreboard: 100 points for the win, 25 for a tie. Real Hackenbush graph games range from trivial 5-edge children's puzzles to research-level infinite-stalk problems.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer, isTerminal, hint: (state: AbsState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: AbsGame,
};
