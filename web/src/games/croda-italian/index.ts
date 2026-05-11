import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CrodaItalianState, CrodaItalianAction, CrodaItalianSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CrodaItalianGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CrodaItalianGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const crodaItalianPlugin: GamePlugin<CrodaItalianState, CrodaItalianAction, typeof settings> = {
  id: "croda-italian",
  title: "Croda Italian Draughts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Modern Italian Croda draughts variant.",
  howToPlay: "Croda is a modern Italian draughts variant developed in the 21st century by Italian draughts theorists looking to add tactical depth to the classic 8x8 game. This 4x4 placement adaptation runs in under a minute. Across 12 turns you and a random CPU place pieces alternately on empty squares. Click an empty cell. The CPU plays uniformly random. After twelve moves whoever has more pieces wins. The full Croda game keeps the 8x8 Italian board but adjusts the men-can't-capture-kings rule and clarifies majority capture priorities. The result is sharper combinations than vanilla Italian Draughts. Final scoreboard: 100 for a win, 25 for a tie. Croda has a small but devoted competitive scene in Northern Italy, especially around Treviso where the variant originated. The 4x4 reduction preserves the placement intuition that drives serious draughts play, useful as a stepping stone before tackling the full Croda ruleset on its native 8x8.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CrodaItalianSettings),
  reducer, isTerminal, hint: (state: CrodaItalianState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: CrodaItalianGame,
};
