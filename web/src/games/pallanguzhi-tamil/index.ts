import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PallanguzhiTamilState, PallanguzhiTamilAction, PallanguzhiTamilSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PallanguzhiTamilGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PallanguzhiTamilGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pallanguzhiTamilPlugin: GamePlugin<PallanguzhiTamilState, PallanguzhiTamilAction, typeof settings> = {
  id: "pallanguzhi-tamil",
  title: "Pallanguzhi (Tamil)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tamil Mancala — placement abstraction.",
  howToPlay: "Pallanguzhi is the Tamil Mancala game played across South India and Sri Lanka for centuries. The full game uses 14 pits (2 rows of 7) with shells or tamarind seeds, played mostly by women in extended families. This 4x4 placement adaptation simplifies the territorial battle. Across 12 turns you and a random CPU alternate placing pieces on empty cells. Click an empty cell. The CPU plays uniformly random. After twelve moves whoever has more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Pallanguzhi appears in Tamil folk songs as a metaphor for fate and provision — the seeds you sow circle back. The full game has multiple modes (Pallam Pidithal, Kashi, etc.) with different capture rules. Tamil Nadu's Department of Sports has promoted Pallanguzhi as a heritage game in schools since 2015. The placement reduction keeps the 'where to claim' intuition while skipping the seed-circulation arithmetic that dominates the full game's strategy.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PallanguzhiTamilSettings),
  reducer, isTerminal, hint: (state: PallanguzhiTamilState): HintTarget | null => ((state.phase === "playing" && state.turn === "P") ? { selector: ".ab-cell:not(.p):not(.c)", pulses: 3 } : null), component: PallanguzhiTamilGame,
};
