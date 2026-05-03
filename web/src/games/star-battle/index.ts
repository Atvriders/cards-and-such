import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StarBattleState, StarBattleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StarBattle = /* @__PURE__ */ lazy(() => import("./StarBattle.js").then((mod) => ({ default: mod.StarBattle as unknown as React.ComponentType<unknown> })));
export const starBattleSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type StarBattleSettingsType = SettingsOf<typeof starBattleSettings>;

export const starBattlePlugin: GamePlugin<StarBattleState, StarBattleAction, typeof starBattleSettings> = {
  id: "star-battle",
  title: "Star Battle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place stars so each row, column, and region has the right count — no two stars touching.",
  howToPlay: `Star Battle is a logic puzzle where you place stars on a grid divided into coloured regions. The rules are simple but the deductions can be subtle:

1. Each row must contain exactly N stars (where N is shown in the puzzle info).
2. Each column must contain exactly N stars.
3. Each coloured region must contain exactly N stars.
4. No two stars may be adjacent — not horizontally, not vertically, and not diagonally. Stars must always have at least one empty cell between them in all eight directions.

To play: click any cell once to place a star (★). Click again to place a dot (·) — dots are your personal markers for "this cell cannot have a star." Click a third time to clear the cell. Stars that violate a rule are highlighted in red.

Strategy: start by finding rows, columns, or regions that are heavily constrained. If placing a star in one cell would force adjacency violations, eliminate it with a dot. The no-adjacency rule is especially powerful — a single star blocks the eight cells surrounding it. Work systematically through rows and columns to narrow down possibilities.`,
  settings: starBattleSettings,
  initialState: (seed: number, settings: StarBattleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".star-battle-grid")) ? { selector: ".star-battle-grid", pulses: 3 } : null,
  component: StarBattle,
};
