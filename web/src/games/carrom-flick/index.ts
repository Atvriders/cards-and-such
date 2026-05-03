import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const carromFlickPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "carrom-flick",
  title: "Carrom (Flick)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flick-capture South Asian abstract.",
  howToPlay: "Carrom is the South Asian flick-and-strike board game where players flick a striker disc to pocket coins. In this 5x5 placement adaptation across 14 turns (7 each), you place coin-pieces on the grid representing flick targets; the CPU plays randomly. Click an empty cell. After 14 moves the higher coin-count wins. Full Carrom has nine white coins, nine black, one red queen, and a striker; players flick their striker with a single fingernail to pocket their coins (and the queen). The queen is special — captured but must be 'covered' by a normal coin or returned. Carrom is hugely popular in India, Pakistan, Bangladesh, Sri Lanka, and Nepal; international tournaments are organized by the International Carrom Federation. Strategy: spread your placements. Final scoreboard: 100 points for the win, 25 for a tie. The flick-and-pocket physics is reduced here to placement; the full board game requires real fingertip control.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer, isTerminal, hint: (state: AbsState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: AbsGame,
};
