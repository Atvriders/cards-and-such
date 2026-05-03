import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TawlbwrddWelshState, TawlbwrddWelshAction, TawlbwrddWelshSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TawlbwrddWelshGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TawlbwrddWelshGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tawlbwrddWelshPlugin: GamePlugin<TawlbwrddWelshState, TawlbwrddWelshAction, typeof settings> = {
  id: "tawlbwrdd-welsh",
  title: "Tawlbwrdd (Welsh Tafl)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Welsh Tafl variant — asymmetric king-escape game.",
  howToPlay: "Tawlbwrdd is the Welsh variant of the Tafl family — asymmetric strategy games where one side defends a king trying to escape and the other side surrounds and captures. This 5x5 placement adaptation focuses on the territorial battle. Across 15 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After fifteen moves the player with more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Historic Tawlbwrdd boards survive in Welsh museum collections; the rules were partially reconstructed from poetic references in the Mabinogion and the Laws of Hywel Dda. The full Tawlbwrdd uses an 11x11 board with the king starting at center surrounded by eight defenders against sixteen attackers. Captures use the Tafl 'custodial' rule — sandwich a piece between two enemies. The placement reduction keeps the territory pull but skips the king-escape victory condition.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TawlbwrddWelshSettings),
  reducer, isTerminal, hint: (state: TawlbwrddWelshState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: TawlbwrddWelshGame,
};
