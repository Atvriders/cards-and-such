import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RussianCheckersFlyingState, RussianCheckersFlyingAction, RussianCheckersFlyingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RussianCheckersFlyingGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RussianCheckersFlyingGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const russianCheckersFlyingPlugin: GamePlugin<RussianCheckersFlyingState, RussianCheckersFlyingAction, typeof settings> = {
  id: "russian-checkers-flying",
  title: "Russian Checkers (Flying)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Russian 8x8 flying-king Draughts variant.",
  howToPlay: "Russian Draughts is the 8x8 flying-king variant of checkers — the standard form played across Russia and the former Soviet states. Kings move and capture along entire diagonals like the bishop in chess. This 5x5 placement adaptation captures the territory-claiming feel without the king-flight calculations. Across 15 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After fifteen moves whoever has more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. The full Russian Draughts is called 'Shashki' and has produced world champions like Israel's Murat Mukhamedzhanov and Russia's own seven-time world champion Iser Kuperman. The flying-king rule creates dramatic late-game endings where a single king can sweep multiple pieces across the long diagonal. The 5x5 reduction preserves the positional scaffolding without the deep search.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RussianCheckersFlyingSettings),
  reducer, isTerminal, hint: (state: RussianCheckersFlyingState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: RussianCheckersFlyingGame,
};
