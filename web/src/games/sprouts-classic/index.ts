import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sproutsClassicPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "sprouts-classic",
  title: "Sprouts (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Conway's topological dots-and-curves game.",
  howToPlay: "Sprouts is John Conway's 1967 dots-and-curves topology game. In this 5x5 placement adaptation across 14 turns (7 each), you place dots on the grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Sprouts starts with several dots; on each turn a player draws a curve from one dot to another (or back to the same dot) and adds a new dot somewhere on that curve. Curves cannot cross; each dot can be touched by at most three curves. The last player able to move wins. The game is famous in graph-theory courses for its provably finite play length (the n-spot game lasts at most 3n-1 moves). Strategy in this simplified placement version: contest the centre and edges. Final scoreboard: 100 points for the win, 25 for a tie. The original Sprouts was published in Martin Gardner's Scientific American column and remains a classic of recreational mathematics.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer, isTerminal, hint: (state: AbsState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: AbsGame,
};
