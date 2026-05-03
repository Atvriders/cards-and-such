import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EuroPegSolitaireState, EuroPegAction } from "./state.js";
import { initialState, reducer, isTerminal, getLegalJumps } from "./state.js";
const EuroPegSolitaire = /* @__PURE__ */ lazy(() => import("./EuroPegSolitaire.js").then((mod) => ({ default: mod.EuroPegSolitaire as unknown as React.ComponentType<unknown> })));
export const euroPegSettings = {
  variant: {
    kind: "enum" as const,
    label: "Board",
    options: ["european"] as const,
    default: "european" as const,
  },
} as const;

type EuroPegSettingsType = SettingsOf<typeof euroPegSettings>;

export const europeanPegSolitairePlugin: GamePlugin<EuroPegSolitaireState, EuroPegAction, typeof euroPegSettings> = {
  id: "european-peg-solitaire",
  title: "European Peg Solitaire",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The 37-cell European variant of Peg Solitaire. Jump pegs to remove them; aim for one peg in the center.",
  howToPlay: `European Peg Solitaire is played on a 37-cell board — larger than the English cross variant. The board is a 7×7 grid with the four extreme corners removed, but the European board adds four extra cells at each diagonal corner of the cross, giving it a rounded octagonal shape with 37 total positions.

The board starts with 36 pegs filling every valid position except the center hole. A move consists of jumping one peg horizontally or vertically over an adjacent peg into an empty hole. The jumped peg is removed from the board. Diagonal jumps are not allowed.

To play: click a peg to select it (it highlights in yellow). Valid jump destinations glow green. Click a green hole to complete the jump. Clicking a selected peg again deselects it.

The goal is to remove as many pegs as possible. The ideal solution leaves exactly one peg in the center hole. The extra four corner cells on the European board create additional routing options compared to the English game, making the puzzle feel different even though the rules are identical.

Scoring: 1000 points for leaving 1 peg in the center, minus 130 for each additional peg remaining, with a minimum of 50. Challenge yourself to find the perfect solution!`,
  settings: euroPegSettings,
  initialState: (seed: number, settings: EuroPegSettingsType) => initialState(seed, settings),
  hint: (state: EuroPegSolitaireState): HintTarget | null => {
    if (state.won) return null;
    for (let i = 0; i < state.cells.length; i++) {
      if (state.cells[i] !== "peg" || !state.valid[i]) continue;
      if (getLegalJumps(state.cells, state.valid, i).length > 0) {
        return { selector: `[data-testid="hint-target-european-peg-solitaire-${i}"]`, pulses: 3 };
      }
    }
    return null;
  },
  reducer,
  isTerminal,
  component: EuroPegSolitaire,
};
