import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThaiDraughtsState, ThaiDraughtsAction, ThaiDraughtsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ThaiDraughtsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ThaiDraughtsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const thaiDraughtsPlugin: GamePlugin<ThaiDraughtsState, ThaiDraughtsAction, typeof settings> = {
  id: "thai-draughts",
  title: "Thai Draughts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Thai 8x8 forward-only-men draughts variant.",
  howToPlay: "Thai Draughts (Mak Hos) is the Thai variant of checkers where ordinary pieces capture only forward — backward captures are reserved for kings. This 4x4 placement adaptation runs in under a minute. Across 12 turns you and a random CPU place pieces alternately on empty squares. Click an empty cell. The CPU plays uniformly random. After twelve moves whoever has more pieces wins. The full Thai Draughts uses an 8x8 board with eight pieces per side; the forward-capture restriction makes the game more positional than International Draughts. Skilled Thai players see their game as more tactical because escape squares matter. Final scoreboard: 100 for a win, 25 for a tie. Mak Hos is played in southern Thai villages and Bangkok cafes, often alongside Makruk (Thai chess). The 4x4 reduction preserves the territory-claim heuristic that experienced players use to plan their men's safe advance toward king row.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThaiDraughtsSettings),
  reducer, isTerminal, hint: (state: ThaiDraughtsState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: ThaiDraughtsGame,
};
